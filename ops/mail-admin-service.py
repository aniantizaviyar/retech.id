#!/usr/bin/env python3
"""Minimal root-side mailbox administration API for RETECH.

The service only listens on loopback and is exposed through the dedicated
mail.retech.id nginx route. Authentication uses a constant-time bearer token.
"""

from __future__ import annotations

import fcntl
import hashlib
import hmac
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


DOMAIN = "retech.id"
LISTEN_HOST = "127.0.0.1"
LISTEN_PORT = 8765
USERS_FILE = Path("/etc/dovecot/users")
VMAILBOX_FILE = Path("/etc/postfix/vmailbox")
VMAIL_ROOT = Path(f"/var/vmail/{DOMAIN}")
ARCHIVE_ROOT = Path(f"/var/vmail/.deleted/{DOMAIN}")
BACKUP_ROOT = Path("/var/backups/retech-mail-admin")
LOCK_FILE = Path("/run/retech-mail-admin.lock")
PROTECTED_USERS = {"admin", "sales", "webform"}
EMAIL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?@retech\.id$")
MAX_BODY = 16 * 1024
TOKEN = os.environ.get("MAIL_ADMIN_TOKEN", "")


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def audit(event: str, email: str = "", outcome: str = "ok") -> None:
    print(json.dumps({"event": event, "email": email, "outcome": outcome, "timestamp": int(time.time())}), flush=True)


def validate_email(value: object) -> str:
    email = str(value or "").strip().lower()
    if not EMAIL_RE.fullmatch(email):
        raise ApiError(400, "Alamat email harus menggunakan domain retech.id dan format yang valid.")
    return email


def validate_password(value: object) -> str:
    password = str(value or "")
    if not 12 <= len(password) <= 128:
        raise ApiError(400, "Password harus berisi 12 sampai 128 karakter.")
    checks = (re.search(r"[a-z]", password), re.search(r"[A-Z]", password), re.search(r"\d", password), re.search(r"[^A-Za-z0-9]", password))
    if not all(checks):
        raise ApiError(400, "Password wajib memiliki huruf kecil, huruf besar, angka, dan simbol.")
    return password


def read_lines(path: Path) -> list[str]:
    return path.read_text(encoding="utf-8").splitlines()


def mailbox_emails() -> list[str]:
    users: list[str] = []
    for line in read_lines(USERS_FILE):
        if not line or line.lstrip().startswith("#") or ":" not in line:
            continue
        email = line.split(":", 1)[0].strip().lower()
        if EMAIL_RE.fullmatch(email):
            users.append(email)
    return sorted(set(users), key=lambda item: (item.split("@", 1)[0] not in PROTECTED_USERS, item))


def directory_size(path: Path) -> int:
    total = 0
    if not path.exists():
        return total
    for root, _, files in os.walk(path):
        for filename in files:
            try:
                total += (Path(root) / filename).stat().st_size
            except FileNotFoundError:
                continue
    return total


def message_count(maildir: Path) -> int:
    count = 0
    for folder in (maildir / "cur", maildir / "new"):
        if folder.exists():
            count += sum(1 for item in folder.iterdir() if item.is_file())
    return count


def mailbox_record(email: str) -> dict[str, object]:
    local = email.split("@", 1)[0]
    maildir = VMAIL_ROOT / local / "Maildir"
    role = "Service account" if local == "webform" else "Administrator" if local == "admin" else "Mailbox utama" if local == "sales" else "Mailbox user"
    return {
        "email": email,
        "storageBytes": directory_size(maildir),
        "messageCount": message_count(maildir),
        "protected": local in PROTECTED_USERS,
        "role": role,
        "quotaBytes": None,
    }


def list_mailboxes() -> dict[str, object]:
    records = [mailbox_record(email) for email in mailbox_emails()]
    disk = shutil.disk_usage(VMAIL_ROOT)
    return {
        "mailboxes": records,
        "storage": {
            "mailboxesBytes": sum(int(record["storageBytes"]) for record in records),
            "serverTotalBytes": disk.total,
            "serverUsedBytes": disk.used,
            "serverFreeBytes": disk.free,
            "quotaConfigured": False,
        },
    }


def password_hash(password: str) -> str:
    result = subprocess.run(
        ["/usr/bin/doveadm", "pw", "-s", "ARGON2ID", "-p", password],
        check=True,
        capture_output=True,
        text=True,
        timeout=10,
    )
    value = result.stdout.strip()
    if not value.startswith("{ARGON2ID}"):
        raise RuntimeError("Dovecot did not return an ARGON2ID hash")
    return value


def backup(path: Path) -> None:
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True, mode=0o700)
    stamp = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
    shutil.copy2(path, BACKUP_ROOT / f"{path.name}.{stamp}.{time.time_ns()}.bak")


def atomic_write(path: Path, lines: list[str]) -> None:
    stat = path.stat()
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        os.fchmod(fd, stat.st_mode & 0o777)
        os.fchown(fd, stat.st_uid, stat.st_gid)
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write("\n".join(lines).rstrip("\n") + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    except Exception:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass
        raise


def update_postfix_map() -> None:
    subprocess.run(["/usr/sbin/postmap", str(VMAILBOX_FILE)], check=True, capture_output=True, timeout=10)


def with_lock():
    LOCK_FILE.touch(exist_ok=True)
    handle = LOCK_FILE.open("r+")
    fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
    return handle


def create_mailbox(email: str, password: str) -> dict[str, object]:
    local = email.split("@", 1)[0]
    with with_lock():
        if email in mailbox_emails():
            raise ApiError(409, "Mailbox sudah tersedia.")
        password_value = password_hash(password)
        users_before = read_lines(USERS_FILE)
        vmailbox_before = read_lines(VMAILBOX_FILE)
        backup(USERS_FILE)
        backup(VMAILBOX_FILE)
        try:
            atomic_write(USERS_FILE, [*users_before, f"{email}:{password_value}"])
            atomic_write(VMAILBOX_FILE, [*vmailbox_before, f"{email} {DOMAIN}/{local}/Maildir/"])
            maildir = VMAIL_ROOT / local / "Maildir"
            for folder in (maildir, maildir / "cur", maildir / "new", maildir / "tmp"):
                folder.mkdir(parents=True, exist_ok=True, mode=0o700)
            shutil.chown(VMAIL_ROOT / local, user="vmail", group="vmail")
            for root, dirs, _ in os.walk(VMAIL_ROOT / local):
                shutil.chown(root, user="vmail", group="vmail")
                for directory in dirs:
                    shutil.chown(Path(root) / directory, user="vmail", group="vmail")
            update_postfix_map()
        except Exception:
            atomic_write(USERS_FILE, users_before)
            atomic_write(VMAILBOX_FILE, vmailbox_before)
            update_postfix_map()
            shutil.rmtree(VMAIL_ROOT / local, ignore_errors=True)
            raise
    audit("mailbox.create", email)
    return mailbox_record(email)


def update_password(email: str, password: str) -> dict[str, object]:
    with with_lock():
        if email not in mailbox_emails():
            raise ApiError(404, "Mailbox tidak ditemukan.")
        password_value = password_hash(password)
        before = read_lines(USERS_FILE)
        updated = [f"{email}:{password_value}" if line.split(":", 1)[0].strip().lower() == email else line for line in before]
        backup(USERS_FILE)
        atomic_write(USERS_FILE, updated)
    audit("mailbox.password_update", email)
    return mailbox_record(email)


def delete_mailbox(email: str, confirmation: object) -> dict[str, object]:
    local = email.split("@", 1)[0]
    if local in PROTECTED_USERS:
        raise ApiError(403, "Mailbox inti dilindungi dan tidak dapat dihapus dari dashboard.")
    if str(confirmation or "").strip().lower() != email:
        raise ApiError(400, "Konfirmasi penghapusan tidak sesuai.")
    with with_lock():
        if email not in mailbox_emails():
            raise ApiError(404, "Mailbox tidak ditemukan.")
        users_before = read_lines(USERS_FILE)
        vmailbox_before = read_lines(VMAILBOX_FILE)
        users_after = [line for line in users_before if line.split(":", 1)[0].strip().lower() != email]
        vmailbox_after = [line for line in vmailbox_before if not line.strip().lower().startswith(f"{email} ")]
        backup(USERS_FILE)
        backup(VMAILBOX_FILE)
        atomic_write(USERS_FILE, users_after)
        atomic_write(VMAILBOX_FILE, vmailbox_after)
        update_postfix_map()
        source = VMAIL_ROOT / local
        archived = None
        if source.exists():
            ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True, mode=0o700)
            archived = ARCHIVE_ROOT / f"{local}-{time.strftime('%Y%m%d-%H%M%S', time.gmtime())}"
            source.rename(archived)
    audit("mailbox.delete_archive", email)
    return {"email": email, "archived": bool(archived)}


class Handler(BaseHTTPRequestHandler):
    server_version = "RETECH-Mail-Admin"
    sys_version = ""

    def log_message(self, format_string: str, *args: object) -> None:
        print(json.dumps({"event": "http", "client": self.client_address[0], "message": format_string % args}), flush=True)

    def send_json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(body)

    def authorized(self) -> bool:
        value = self.headers.get("Authorization", "")
        supplied = value.removeprefix("Bearer ").strip() if value.startswith("Bearer ") else ""
        return bool(TOKEN) and hmac.compare_digest(supplied, TOKEN)

    def body(self) -> dict[str, object]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ApiError(400, "Content-Length tidak valid.") from error
        if length <= 0 or length > MAX_BODY:
            raise ApiError(400, "Ukuran request tidak valid.")
        try:
            parsed = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ApiError(400, "JSON tidak valid.") from error
        if not isinstance(parsed, dict):
            raise ApiError(400, "Payload harus berupa object.")
        return parsed

    def mailbox_from_path(self) -> str:
        path = urlparse(self.path).path
        prefix = "/api/v1/mailboxes/"
        if not path.startswith(prefix):
            raise ApiError(404, "Endpoint tidak ditemukan.")
        return validate_email(unquote(path[len(prefix):]))

    def dispatch(self) -> None:
        if not self.authorized():
            raise ApiError(401, "Unauthorized.")
        path = urlparse(self.path).path
        if self.command == "GET" and path == "/api/v1/mailboxes":
            self.send_json(200, list_mailboxes())
            return
        if self.command == "POST" and path == "/api/v1/mailboxes":
            data = self.body()
            record = create_mailbox(validate_email(data.get("email")), validate_password(data.get("password")))
            self.send_json(201, {"ok": True, "mailbox": record})
            return
        if self.command == "PATCH":
            email = self.mailbox_from_path()
            record = update_password(email, validate_password(self.body().get("password")))
            self.send_json(200, {"ok": True, "mailbox": record})
            return
        if self.command == "DELETE":
            email = self.mailbox_from_path()
            result = delete_mailbox(email, self.body().get("confirmation"))
            self.send_json(200, {"ok": True, **result})
            return
        raise ApiError(404, "Endpoint tidak ditemukan.")

    def handle_request(self) -> None:
        try:
            self.dispatch()
        except ApiError as error:
            self.send_json(error.status, {"error": error.message})
        except Exception as error:
            audit("api.error", outcome=type(error).__name__)
            self.send_json(500, {"error": "Operasi mail server gagal diproses."})

    do_GET = handle_request
    do_POST = handle_request
    do_PATCH = handle_request
    do_DELETE = handle_request


def main() -> None:
    if len(TOKEN) < 32:
        raise SystemExit("MAIL_ADMIN_TOKEN is missing or too short")
    server = ThreadingHTTPServer((LISTEN_HOST, LISTEN_PORT), Handler)
    server.daemon_threads = True
    print(json.dumps({"event": "startup", "listen": f"{LISTEN_HOST}:{LISTEN_PORT}"}), flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
