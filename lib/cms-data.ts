import "server-only";
import type { Locale } from "./i18n";
import { cmsPageSeeds, pageSeed, type PageContent } from "./cms-defaults";
import { faqs, englishFaqs } from "./faqs";
import { englishServices, getFallbackServices, services, type ServiceDefinition } from "./services";
import { fallbackPricing, pricingSeeds, type PricingRecord } from "./pricing";
import { englishProjectContent } from "./projects";
import { getFallbackProducts, productSeeds, type ProductDefinition } from "./products";
import { getSupabaseAdminConfig, supabaseAdminFetch } from "./supabase-admin";

function cmsHeaders() {
  const { key } = getSupabaseAdminConfig();
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function publicCmsFetch(path: string) {
  const { url } = getSupabaseAdminConfig();
  return fetch(`${url}${path}`, { headers: cmsHeaders(), next: { revalidate: 60, tags: ["cms-content"] } });
}

export async function getPageContent(slug: string, locale: Locale): Promise<PageContent> {
  const seed = pageSeed(slug);
  const fallback = locale === "en" ? seed?.dataEn || {} : seed?.dataId || {};
  try {
    const response = await publicCmsFetch(`/rest/v1/cms_pages?select=data_id,data_en&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`);
    if (!response.ok) return fallback;
    const rows = await response.json() as Array<{ data_id?: PageContent; data_en?: PageContent }>;
    const override = locale === "en" ? rows[0]?.data_en : rows[0]?.data_id;
    return { ...fallback, ...(override && typeof override === "object" ? override : {}) };
  } catch {
    return fallback;
  }
}

export async function getServices(locale: Locale): Promise<ServiceDefinition[]> {
  try {
    const response = await publicCmsFetch("/rest/v1/cms_services?select=slug,data_id,data_en&published=eq.true&order=sort_order.asc");
    if (!response.ok) return getFallbackServices(locale);
    const rows = await response.json() as Array<{ slug: string; data_id: Omit<ServiceDefinition, "slug">; data_en: Omit<ServiceDefinition, "slug"> }>;
    const normalized = rows.map((row) => ({ slug: row.slug, ...(locale === "en" ? row.data_en : row.data_id) })).filter((item) => item.title && Array.isArray(item.includes));
    return normalized.length ? normalized : getFallbackServices(locale);
  } catch {
    return getFallbackServices(locale);
  }
}

export async function getService(slug: string, locale: Locale) {
  return (await getServices(locale)).find((service) => service.slug === slug);
}

export async function getProducts(locale: Locale): Promise<ProductDefinition[]> {
  try {
    const response = await publicCmsFetch("/rest/v1/cms_products?select=slug,data_id,data_en&published=eq.true&order=sort_order.asc");
    if (!response.ok) return getFallbackProducts(locale);
    const rows = await response.json() as Array<{ slug: string; data_id: Omit<ProductDefinition, "slug">; data_en: Omit<ProductDefinition, "slug"> }>;
    const normalized = rows.map((row) => ({ slug: row.slug, ...(locale === "en" ? row.data_en : row.data_id) })).filter((item) => item.title && Array.isArray(item.plans));
    return normalized.length ? normalized : getFallbackProducts(locale);
  } catch {
    return getFallbackProducts(locale);
  }
}

export async function getProduct(slug: string, locale: Locale) {
  return (await getProducts(locale)).find((product) => product.slug === slug);
}

export async function getFaqs(locale: Locale) {
  try {
    const response = await publicCmsFetch("/rest/v1/cms_faqs?select=question_id,answer_id,question_en,answer_en&published=eq.true&order=sort_order.asc");
    if (!response.ok) return locale === "en" ? englishFaqs : faqs;
    const rows = await response.json() as Array<{ question_id: string; answer_id: string; question_en: string; answer_en: string }>;
    const normalized = rows.map((row) => locale === "en" ? { question: row.question_en, answer: row.answer_en } : { question: row.question_id, answer: row.answer_id });
    return normalized.length ? normalized : (locale === "en" ? englishFaqs : faqs);
  } catch {
    return locale === "en" ? englishFaqs : faqs;
  }
}

export async function getPricing(locale: Locale): Promise<PricingRecord[]> {
  try {
    const response = await publicCmsFetch("/rest/v1/cms_pricing?select=id,slug,section,data_id,data_en,sort_order&published=eq.true&order=section.asc,sort_order.asc");
    if (!response.ok) return fallbackPricing(locale);
    const rows = await response.json() as Array<{ id: string; slug: string; section: PricingRecord["section"]; data_id: PricingRecord["data"]; data_en: PricingRecord["data"]; sort_order: number }>;
    const normalized = rows.map((row) => ({ id: row.id, slug: row.slug, section: row.section, data: locale === "en" ? row.data_en : row.data_id, sortOrder: row.sort_order }));
    return normalized.length ? normalized : fallbackPricing(locale);
  } catch {
    return fallbackPricing(locale);
  }
}

async function tableIsEmpty(table: string) {
  const response = await supabaseAdminFetch(`/rest/v1/${table}?select=*&limit=1`);
  if (!response.ok) throw new Error(`CMS table ${table} is unavailable`);
  return ((await response.json()) as unknown[]).length === 0;
}

async function insertRows(table: string, rows: unknown[]) {
  if (!rows.length) return;
  const response = await supabaseAdminFetch(`/rest/v1/${table}`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(rows) });
  if (!response.ok) throw new Error(`Could not seed ${table}: ${await response.text()}`);
}

export async function ensureCmsSeeded() {
  if (await tableIsEmpty("cms_pages")) {
    await insertRows("cms_pages", cmsPageSeeds.map((page) => ({ slug: page.slug, label: page.label, data_id: page.dataId, data_en: page.dataEn, published: true })));
  }
  if (await tableIsEmpty("cms_services")) {
    await insertRows("cms_services", services.map((service, index) => {
      const { slug, ...dataId } = service;
      return { slug, data_id: dataId, data_en: englishServices[slug] || dataId, published: true, sort_order: index + 1 };
    }));
  }
  if (await tableIsEmpty("cms_products")) {
    await insertRows("cms_products", productSeeds.map((product) => ({ slug: product.slug, data_id: product.dataId, data_en: product.dataEn, published: true, sort_order: product.sortOrder })));
  }
  if (await tableIsEmpty("cms_faqs")) {
    await insertRows("cms_faqs", faqs.map((faq, index) => ({ question_id: faq.question, answer_id: faq.answer, question_en: englishFaqs[index]?.question || faq.question, answer_en: englishFaqs[index]?.answer || faq.answer, published: true, sort_order: index + 1 })));
  }
  if (await tableIsEmpty("cms_pricing")) {
    await insertRows("cms_pricing", pricingSeeds.map((record) => ({ slug: record.slug, section: record.section, data_id: record.dataId, data_en: record.dataEn, published: true, sort_order: record.sortOrder })));
  }

  const projectResponse = await supabaseAdminFetch("/rest/v1/portfolio_projects?select=slug,gallery,title_en");
  if (projectResponse.ok) {
    const projects = await projectResponse.json() as Array<{ slug: string; gallery: Array<{ src: string; alt: string; alt_en?: string }>; title_en?: string | null }>;
    await Promise.all(projects.map(async (project) => {
      const translation = englishProjectContent[project.slug];
      if (!translation || project.title_en) return;
      await supabaseAdminFetch(`/rest/v1/portfolio_projects?slug=eq.${encodeURIComponent(project.slug)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          title_en: translation.title,
          category_en: translation.category,
          summary_en: translation.summary,
          challenge_en: translation.challenge,
          solution_en: translation.solution,
          outcome_en: translation.outcome,
          services_en: translation.services,
          gallery: project.gallery.map((image, index) => ({ ...image, alt_en: translation.galleryAlt[index] || image.alt })),
        }),
      });
    }));
  }
}
