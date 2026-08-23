import Image from "next/image";
import Link from "next/link";
import { companyContact } from "@/lib/company";
import { localePath, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} />
        <p>PT. Retech Digital Solution<br />IT solutions that move business forward.</p>
      </div>
      <address className="footer-contact">
        <a href={companyContact.mapUrl} target="_blank" rel="noreferrer">
          <span>{en ? "BUSINESS ADDRESS" : "ALAMAT BISNIS"}</span>
          {companyContact.address}
        </a>
        <a
          href={locale === "en" ? companyContact.whatsappUrlEn : companyContact.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          data-analytics="whatsapp_click"
          data-analytics-source="footer"
        >
          <span>WHATSAPP · {en ? "CHAT ONLY" : "HANYA CHAT"}</span>
          {companyContact.whatsappDisplay}
        </a>
        <a href={`mailto:${companyContact.email}`}>
          <span>EMAIL</span>
          {companyContact.email}
        </a>
      </address>
      <nav className="footer-nav" aria-label="Footer navigation">
        <Link href={localePath(locale, "/about")}>{en ? "About" : "Tentang"}</Link>
        <Link href={localePath(locale, "/services")}>{en ? "Services" : "Layanan"}</Link>
        <Link href={localePath(locale, "/work")}>Case Studies</Link>
        <Link href={localePath(locale, "/pricing")}>Pricing</Link>
        <Link href={localePath(locale, "/faq")}>FAQ</Link>
        <Link href={localePath(locale, "/privacy-policy")}>{en ? "Privacy" : "Privasi"}</Link>
      </nav>
      <small>© {new Date().getFullYear()} RETECH. {en ? "All rights reserved." : "Seluruh hak dilindungi."}</small>
    </footer>
  );
}
