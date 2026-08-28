import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPageContent, getProducts } from "@/lib/cms-data";
import { languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/products");
  const description = en
    ? "Subscription products from RETECH for QR ordering, POS operations, and secure employee attendance."
    : "Produk berlangganan RETECH untuk QR ordering, operasional POS, dan absensi karyawan yang aman.";
  return {
    title: en ? "Subscription Products" : "Produk Berlangganan",
    description,
    alternates: { canonical, languages: languageAlternates("/products") },
    openGraph: { type: "website", url: canonical, title: en ? "RETECH Subscription Products" : "Produk Berlangganan RETECH", description, images: [{ url: "/privacy-safe/qr-order-pos.png", alt: "RETECH subscription products" }] },
    twitter: { card: "summary_large_image", title: en ? "RETECH Subscription Products" : "Produk Berlangganan RETECH", description, images: ["/privacy-safe/qr-order-pos.png"] },
  };
}
export default async function ProductsPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const products = await getProducts(locale);
  const page = await getPageContent("products", locale);
  return (
    <main>
      <SiteHeader locale={locale} />
      <section className="products-hero">
        <span className="kicker">RETECH PRODUCTS</span>
        <h1>{String(page.heroTitle || (en ? "Operational software." : "Software operasional."))}<br /><em>{String(page.heroTitleAccent || (en ? "Ready to grow with you." : "Tumbuh bersama bisnis."))}</em></h1>
        <div className="products-hero-copy"><p>{String(page.heroIntro || "")}</p><span>{en ? "Monthly subscription • Privacy by design" : "Langganan bulanan • Privacy by design"}</span></div>
      </section>

      <section className="product-directory">
        {products.map((product, index) => (
          <article className="product-showcase" key={product.slug}>
            <div className="product-showcase-copy">
              <span className="product-index">0{index + 1} / {product.eyebrow}</span>
              <h2>{product.title}</h2>
              <p>{product.summary}</p>
              <div className="product-audience">{product.audiences.map((item) => <span key={item}>{item}</span>)}</div>
              <Link className="button button-primary" href={localePath(locale, `/products/${product.slug}`)}>{en ? "Explore product" : "Lihat produk"} <span>↗</span></Link>
            </div>
            <Link className="product-showcase-media" href={localePath(locale, `/products/${product.slug}`)} aria-label={`${en ? "View" : "Lihat"} ${product.title}`}>
              <Image src={product.heroImage} alt={product.heroAlt} fill sizes="(max-width: 900px) 100vw, 56vw" priority={index === 0} />
              <span>{en ? "PRODUCT PREVIEW" : "PREVIEW PRODUK"}</span>
            </Link>
          </article>
        ))}
      </section>

      <section className="subscription-principles">
        <div><span className="kicker">SUBSCRIPTION BY DESIGN</span><h2>{en ? "One platform." : "Satu platform."}<br /><em>{en ? "Every customer isolated." : "Setiap customer terpisah."}</em></h2></div>
        <div className="subscription-principle-grid">
          {(en ? [
            ["Multi-tenant foundation", "Every customer receives an isolated workspace, users, roles, and product configuration."],
            ["Controlled activation", "Service access follows verified payment and a clear subscription lifecycle."],
            ["Portable ownership", "Customer data can be exported according to plan, retention policy, and contract."],
          ] : [
            ["Fondasi multi-tenant", "Setiap customer mendapat workspace, user, role, dan konfigurasi produk yang terpisah."],
            ["Aktivasi terkendali", "Akses layanan mengikuti pembayaran terverifikasi dan lifecycle subscription yang jelas."],
            ["Kepemilikan portabel", "Data customer dapat diekspor sesuai paket, kebijakan retensi, dan kontrak."],
          ]).map(([title, copy]) => <article key={title}><strong>{title}</strong><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="product-cta">
        <span className="kicker">START WITH A PILOT</span>
        <h2>{String(page.ctaTitle || (en ? "Choose a focused pilot." : "Mulai dari pilot terarah."))}<br /><em>{String(page.ctaTitleAccent || (en ? "Scale after it works." : "Scale setelah terbukti."))}</em></h2>
        <p>{String(page.ctaIntro || "")}</p>
        <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="products">{en ? "Discuss a pilot" : "Diskusikan pilot"} <span>↗</span></Link>
      </section>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
