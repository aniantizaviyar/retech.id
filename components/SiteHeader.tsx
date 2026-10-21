"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { localePath, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href={localePath(locale, "/")} aria-label="RETECH home">
        <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} priority unoptimized />
        <span className="brand-name" aria-hidden="true">RETECH<small>DIGITAL SOLUTION</small></span>
      </Link>
      <nav id="site-navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
        <Link href={localePath(locale, "/services")}>{en ? "Services" : "Layanan"}</Link>
        <Link href={localePath(locale, "/products")}>{en ? "Products" : "Produk"}</Link>
        <Link href={localePath(locale, "/work")}>Case Studies</Link>
        <Link href={localePath(locale, "/pricing")}>Pricing</Link>
        <Link href={localePath(locale, "/about")}>{en ? "About" : "Tentang"}</Link>
        <Link href={localePath(locale, "/faq")}>FAQ</Link>
        <Link href={localePath(locale, "/#contact")}>{en ? "Contact" : "Kontak"}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher locale={locale} />
        <button className="site-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" aria-label={en ? "Toggle navigation" : "Buka/tutup navigasi"} onClick={() => setMenuOpen(!menuOpen)}>Menu {menuOpen ? "×" : "☰"}</button>
        <Link className="nav-cta" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="header">
          {en ? "Let's talk" : "Hubungi kami"} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
