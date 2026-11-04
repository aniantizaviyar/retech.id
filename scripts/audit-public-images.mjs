import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.argv[2] || "https://retech.id";
const output = process.argv[3] || "deliverables/site-image-audit-20261104/production-before.json";
const origin = new URL(base).origin;
const legacy = new Set([
  "/privacy-safe/logistics-platform.png", "/privacy-safe/operations-cms.png",
  "/privacy-safe/hrms-attendance.png", "/privacy-safe/infrastructure-observability.png",
  "/privacy-safe/android-attendance.png", "/privacy-safe/qr-order-pos.png",
]);
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
function source(value, page) {
  try {
    const url = new URL(decode(value), page);
    if (url.pathname === "/_next/image" && url.searchParams.has("url")) return source(url.searchParams.get("url"), page);
    return url.origin === origin || url.origin === "https://retech.id" ? url.pathname : url.href;
  } catch { return value; }
}
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
  return { status: response.status, html: await response.text() };
}
const sitemap = await fetchText(new URL("/sitemap.xml", base));
if (sitemap.status !== 200) throw new Error(`Sitemap HTTP ${sitemap.status}`);
const paths = [...new Set([...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(decode(m[1])).pathname))];
if (!paths.length || paths.length > 100) throw new Error("Unexpected sitemap size");
const pages = [];
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < paths.length) {
    const path = paths[cursor++];
    const url = new URL(path, base);
    try {
      const { status, html } = await fetchText(url);
      const images = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => attrs(m[0])).map((a) => ({ src: source(a.src || "", url), alt: a.alt || "" }));
      const social = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attrs(m[0])).filter((a) => ["og:image", "twitter:image"].includes(a.property || a.name)).map((a) => source(a.content || "", url));
      const oldImages = [...new Set([...images.map((i) => i.src), ...social].filter((src) => legacy.has(src)))];
      const links = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => attrs(m[0]).href).filter(Boolean).map((href) => { try { const u = new URL(href, url); return u.origin === origin ? u.pathname : null; } catch { return null; } }).filter(Boolean);
      pages.push({ path, status, language: html.match(/<html[^>]*lang="([^"]+)"/)?.[1], images, social, oldImages, links: [...new Set(links)] });
    } catch (error) { pages.push({ path, error: error.message }); }
  }
}));
pages.sort((a, b) => a.path.localeCompare(b.path));
const assetChecks = [];
for (const path of [...new Set(pages.flatMap(p => [...(p.images || []).map(i => i.src), ...(p.social || [])]))].filter(path => path.startsWith("/"))) {
  try {
    const response = await fetch(new URL(path, base), { method: "HEAD", signal: AbortSignal.timeout(15_000) });
    assetChecks.push({ path, status: response.status });
  } catch (error) { assetChecks.push({ path, error: error.message }); }
}
const result = { origin, checkedAt: new Date().toISOString(), pageCount: pages.length, affectedCount: pages.filter((p) => p.oldImages?.length).length, pages, assetChecks };
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(`Audited ${pages.length} public sitemap pages; ${result.affectedCount} have legacy illustration references.`);
for (const p of pages) console.log(`${p.status || "ERR"} ${p.path}: ${p.oldImages?.join(", ") || "no legacy illustration"}${p.error ? ` (${p.error})` : ""}`);
console.log(`Report: ${output}`);
console.log(`Assets: ${assetChecks.length} checked; ${assetChecks.filter(a=>a.status!==200).length} failures.`);
