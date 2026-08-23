export type Locale = "id" | "en";

export const localeConfig = {
  id: { htmlLang: "id", schemaLang: "id-ID", label: "ID" },
  en: { htmlLang: "en", schemaLang: "en-US", label: "EN" },
} as const;

export function localePath(locale: Locale, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "id") return normalized;
  if (normalized === "/") return "/en";
  return `/en${normalized}`;
}

export function absoluteLocaleUrl(locale: Locale, path: string) {
  return `https://retech.id${localePath(locale, path) === "/" ? "" : localePath(locale, path)}`;
}

export function languageAlternates(path: string) {
  return {
    "id-ID": localePath("id", path),
    "en-US": localePath("en", path),
    "x-default": localePath("id", path),
  };
}
