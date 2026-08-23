export const CMS_RESOURCES = ["pages", "services", "faqs", "pricing", "projects"] as const;
export type CmsResource = typeof CMS_RESOURCES[number];

const SLUG = /^[a-z0-9][a-z0-9-]{1,79}$/;

function text(value: unknown, max = 5000) {
  return typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) : "";
}

function boolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function integer(value: unknown, fallback = 99) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 9999 ? number : fallback;
}

function object(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const encoded = JSON.stringify(value);
  if (encoded.length > 100_000) throw new Error("Data terlalu besar.");
  return JSON.parse(encoded) as Record<string, unknown>;
}

function strings(value: unknown, maxItems = 30) {
  return Array.isArray(value) ? value.slice(0, maxItems).map((item) => text(item, 200)).filter(Boolean) : [];
}

function slug(value: unknown) {
  const normalized = text(value, 80).toLowerCase();
  if (!SLUG.test(normalized)) throw new Error("Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.");
  return normalized;
}

function gallery(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((entry) => {
    const item = object(entry);
    const src = text(item.src, 1000);
    if (!src.startsWith("/") && !/^https:\/\/[a-z0-9.-]+\/storage\/v1\/object\/public\/cms-media\//i.test(src)) throw new Error("URL media tidak diizinkan.");
    return { src, alt: text(item.alt, 300), alt_en: text(item.alt_en, 300) };
  }).filter((item) => item.src);
}

export function normalizeCmsRecord(resource: CmsResource, input: unknown) {
  const record = object(input);
  if (resource === "pages") return {
    slug: slug(record.slug), label: text(record.label, 120), data_id: object(record.data_id), data_en: object(record.data_en), published: boolean(record.published, true),
  };
  if (resource === "services") return {
    slug: slug(record.slug), data_id: object(record.data_id), data_en: object(record.data_en), published: boolean(record.published, true), sort_order: integer(record.sort_order),
  };
  if (resource === "faqs") return {
    question_id: text(record.question_id, 500), answer_id: text(record.answer_id, 5000), question_en: text(record.question_en, 500), answer_en: text(record.answer_en, 5000), published: boolean(record.published, true), sort_order: integer(record.sort_order),
  };
  if (resource === "pricing") {
    const section = text(record.section, 30);
    if (!["development", "support", "hosting"].includes(section)) throw new Error("Section pricing tidak valid.");
    return { slug: slug(record.slug), section, data_id: object(record.data_id), data_en: object(record.data_en), published: boolean(record.published, true), sort_order: integer(record.sort_order) };
  }
  const status = record.status === "in-development" ? "in-development" : "live";
  return {
    slug: slug(record.slug),
    title: text(record.title, 200), title_en: text(record.title_en, 200),
    category: text(record.category, 120), category_en: text(record.category_en, 120),
    status,
    summary: text(record.summary), summary_en: text(record.summary_en),
    challenge: text(record.challenge), challenge_en: text(record.challenge_en),
    solution: text(record.solution), solution_en: text(record.solution_en),
    outcome: text(record.outcome), outcome_en: text(record.outcome_en),
    services: strings(record.services), services_en: strings(record.services_en), gallery: gallery(record.gallery),
    featured: boolean(record.featured), published: boolean(record.published, true), sort_order: integer(record.sort_order),
  };
}

export function isCmsResource(value: string): value is CmsResource {
  return (CMS_RESOURCES as readonly string[]).includes(value);
}
