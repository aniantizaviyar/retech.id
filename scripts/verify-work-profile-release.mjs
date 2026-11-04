import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const origin = process.argv[2] || "https://retech.id";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const profile = JSON.parse(await readFile(new URL("../lib/company-profile.json", import.meta.url), "utf8"));

async function get(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}

for (const locale of ["id", "en"]) {
  const prefix = locale === "en" ? "/en" : "";
  const work = await (await get(`${prefix}/work`)).text();
  assert.match(work, new RegExp(`<html[^>]*lang="${locale}"`));
  assert.match(work, /work-20261104/);
  assert.ok(work.includes(locale === "en" ? "not original customer screenshots" : "bukan screenshot asli customer"));
  const about = await (await get(`${prefix}/about`)).text();
  assert.ok(about.includes(profile.download));
  assert.match(about, /4 November 2026/);
  assert.match(about, /work-20261104/);
  console.log(`${prefix || "/id"}: Work and About revision verified`);
}

for (const path of [...new Set([...profile.id.cases.map((item) => item.image), "/privacy-safe/work-20261104/qr-order-pos.webp"]), profile.download, "/retech-logo.png"]) {
  const remote = Buffer.from(await (await get(path)).arrayBuffer());
  const localPath = `../public${path.split("?")[0]}`;
  const local = await readFile(new URL(localPath, import.meta.url));
  assert.equal(hash(remote), hash(local), `${path}: published bytes must match reviewed artifact`);
  console.log(`${path}: SHA-256 match (${remote.length} bytes)`);
}

for (const path of ["/", "/products", "/products/qr-order-pos", "/work/logistics-company-website"]) {
  const html = await (await get(path)).text();
  assert.match(html, /work-20261104/, `${path}: use the shared approved visual catalog`);
  assert.doesNotMatch(html, /%2Fprivacy-safe%2F(?:logistics-platform|operations-cms|hrms-attendance|infrastructure-observability|android-attendance|qr-order-pos)\.png/);
  console.log(`${path}: shared public visual catalog verified`);
}
