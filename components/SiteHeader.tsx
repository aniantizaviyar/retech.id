import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="RETECH home">
        <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} priority />
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/services">Services</Link>
        <Link href="/work">Case Studies</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/#approach">Approach</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
      <Link className="nav-cta" href="/#contact" data-analytics="contact_cta_click" data-analytics-source="header">
        Let&apos;s talk <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
