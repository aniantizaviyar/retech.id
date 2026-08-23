import Image from "next/image";
import Link from "next/link";
import { companyContact } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} />
        <p>PT. Retech Digital Solution<br />IT solutions that move business forward.</p>
      </div>
      <address className="footer-contact">
        <a href={companyContact.mapUrl} target="_blank" rel="noreferrer">
          <span>BUSINESS ADDRESS</span>
          {companyContact.address}
        </a>
        <a
          href={companyContact.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          data-analytics="whatsapp_click"
          data-analytics-source="footer"
        >
          <span>WHATSAPP · CHAT ONLY</span>
          {companyContact.whatsappDisplay}
        </a>
        <a href={`mailto:${companyContact.email}`}>
          <span>EMAIL</span>
          {companyContact.email}
        </a>
      </address>
      <nav className="footer-nav" aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/work">Case Studies</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/privacy-policy">Privacy</Link>
      </nav>
      <small>© {new Date().getFullYear()} RETECH. All rights reserved.</small>
    </footer>
  );
}
