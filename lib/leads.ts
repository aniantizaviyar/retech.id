export const SERVICE_OPTIONS = [
  "Digital Product & Application Development",
  "Managed Infrastructure & IT Operations",
  "Remote IT & Server Deployment",
  "Konsultasi kebutuhan lainnya",
] as const;

export type LeadInput = {
  name: string;
  phone: string;
  service: string;
  needs: string;
};

export type LeadValidationResult =
  | { ok: true; data: LeadInput }
  | { ok: false; error: string; field: keyof LeadInput };

const NAME_PATTERN = /^(?=(?:.*\p{L}){2})[\p{L}\p{M}.'’ -]{2,80}$/u;
const PHONE_INPUT_PATTERN = /^\+?[0-9\s().-]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function cleanSingleLine(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function cleanMultiline(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.normalize("NFKC").replace(/\r\n?/g, "\n").trim().slice(0, maxLength)
    : "";
}

export function normalizePhone(value: unknown) {
  const phone = cleanSingleLine(value, 30);
  if (!PHONE_INPUT_PATTERN.test(phone)) return "";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return phone.startsWith("+") ? `+${digits}` : digits;
}

export function validateLeadInput(input: Record<string, unknown>): LeadValidationResult {
  const name = cleanSingleLine(input.name, 100);
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, field: "name", error: "Nama harus berisi minimal 2 huruf dan tidak boleh berisi angka." };
  }

  const phone = normalizePhone(input.phone);
  if (!phone) {
    return { ok: false, field: "phone", error: "Nomor telepon hanya boleh berisi 8–15 digit, dengan awalan + bila diperlukan." };
  }

  const service = cleanSingleLine(input.service, 100);
  if (!SERVICE_OPTIONS.includes(service as (typeof SERVICE_OPTIONS)[number])) {
    return { ok: false, field: "service", error: "Silakan pilih layanan dari daftar yang tersedia." };
  }

  const needs = cleanMultiline(input.needs, 2000);
  if (needs.length < 10 || CONTROL_CHARACTERS.test(needs)) {
    return { ok: false, field: "needs", error: "Jelaskan kebutuhan minimal 10 karakter tanpa karakter kontrol." };
  }

  return { ok: true, data: { name, phone, service, needs } };
}
