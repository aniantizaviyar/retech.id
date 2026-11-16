export const MAX_QUOTATION_CC = 10;
export const MAX_QUOTATION_CC_LENGTH = MAX_QUOTATION_CC * 256;

// Accept plain mailboxes only, never display names, SMTP groups or headers.
const mailboxPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const controlCharacters = /[\x00-\x1f\x7f]/;

export function isQuotationMailbox(value: string) {
  return value.length <= 254 && value.indexOf("@") <= 64 && !controlCharacters.test(value) && mailboxPattern.test(value);
}

export function parseQuotationCc(value: string, primary: string): string[] {
  if (value.length > MAX_QUOTATION_CC_LENGTH || controlCharacters.test(value)) {
    throw new Error("Kolom CC terlalu panjang atau mengandung karakter yang tidak diizinkan.");
  }
  const entries = value.split(/[,;]/).map((entry) => entry.trim()).filter(Boolean);
  if (entries.length > MAX_QUOTATION_CC) throw new Error(`Maksimal ${MAX_QUOTATION_CC} alamat CC.`);
  const seen = new Set([primary.trim().toLowerCase()]);
  return entries.filter((entry, index) => {
    if (!isQuotationMailbox(entry)) throw new Error(`Alamat CC ke-${index + 1} tidak valid.`);
    const key = entry.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
