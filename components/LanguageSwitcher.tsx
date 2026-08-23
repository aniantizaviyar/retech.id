"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const basePath = pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const englishPath = basePath === "/" ? "/en" : `/en${basePath}`;

  return (
    <div className="language-switcher" role="group" aria-label={locale === "en" ? "Choose language" : "Pilih bahasa"}>
      <a className={locale === "id" ? "active" : ""} href={basePath} hrefLang="id-ID" lang="id" aria-current={locale === "id" ? "page" : undefined}>ID</a>
      <a className={locale === "en" ? "active" : ""} href={englishPath} hrefLang="en-US" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</a>
    </div>
  );
}
