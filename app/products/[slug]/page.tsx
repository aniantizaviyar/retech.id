import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "../../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProduct } from "@/lib/cms-data";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { productSeeds } from "@/lib/products";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return productSeeds.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const product = await getProduct((await params).slug, locale);
  if (!product) return { title: "Product" };
  const path = `/products/${product.slug}`;
  const canonical = localePath(locale, path);
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical, languages: languageAlternates(path) },
    openGraph: { type: "website", url: canonical, title: `${product.title} | RETECH`, description: product.summary, images: [{ url: product.heroImage, alt: product.heroAlt }] },
    twitter: { card: "summary_large_image", title: `${product.title} | RETECH`, description: product.summary, images: [product.heroImage] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const locale = await getLocale();
  const en = locale === "en";
  const product = await getProduct((await params).slug, locale);
  if (!product) notFound();
  const productUrl = absoluteLocaleUrl(locale, `/products/${product.slug}`);
  const productSchema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${productUrl}#product`, name: product.title,
    description: product.summary, url: productUrl, image: `https://retech.id${product.heroImage}`, applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android", inLanguage: localeConfig[locale].schemaLang, provider: { "@id": "https://retech.id/#organization" },
    offers: product.plans.filter((plan) => /\d/.test(plan.price)).map((plan) => ({ "@type": "Offer", name: plan.name, description: plan.description, priceCurrency: "IDR", availability: "https://schema.org/PreOrder" })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : "Beranda", item: absoluteLocaleUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: en ? "Products" : "Produk", item: absoluteLocaleUrl(locale, "/products") },
      { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />
      <article className="product-detail">
        <header className="product-detail-hero">
          <div className="product-detail-copy">
            <Link className="back-link" href={localePath(locale, "/products")}>← {en ? "All products" : "Semua produk"}</Link>
            <span className="kicker">{product.eyebrow}</span>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <div className="product-audience">{product.audiences.map((item) => <span key={item}>{item}</span>)}</div>
            <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source={`product_${product.slug}`}>{en ? "Request pilot access" : "Minta akses pilot"} <span>↗</span></Link>
          </div>
          <div className="product-detail-media"><Image src={product.heroImage} alt={product.heroAlt} fill sizes="(max-width: 900px) 100vw, 52vw" priority /><span>{en ? "FICTIONAL, PRIVACY-SAFE PRODUCT PREVIEW" : "PREVIEW PRODUK FIKTIF & AMAN UNTUK PRIVASI"}</span></div>
        </header>

        <section className="product-feature-section">
          <div className="product-section-heading"><span className="kicker">01 / CAPABILITIES</span><h2>{en ? "From daily activity" : "Dari aktivitas harian"}<br /><em>{en ? "to useful control." : "menjadi kontrol yang berguna."}</em></h2></div>
          <div className="product-feature-grid">{product.features.map((feature, index) => <article key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.copy}</p></article>)}</div>
        </section>

        <section className="product-workflow-section">
          <div className="product-section-heading"><span className="kicker">02 / WORKFLOW</span><h2>{en ? "A clear flow." : "Alur yang jelas."}<br /><em>{en ? "Less operational friction." : "Lebih sedikit hambatan."}</em></h2></div>
          <div className="product-workflow-grid">{product.workflow.map((step, index) => <article key={step.title}><b>0{index + 1}</b><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</div>
        </section>

        <section className="product-security-section">
          <div className="product-section-heading"><span className="kicker">03 / TRUST FOUNDATION</span><h2>{en ? "Security is part" : "Keamanan menjadi bagian"}<br /><em>{en ? "of the product." : "dari produk."}</em></h2></div>
          <div className="product-security-grid">{product.safeguards.map((item) => <article key={item.title}><i /><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
        </section>

        <section className="product-pricing-section">
          <div className="product-section-heading"><span className="kicker">04 / SUBSCRIPTION</span><h2>{en ? "Start focused." : "Mulai terarah."}<br /><em>{en ? "Scale when ready." : "Scale saat siap."}</em></h2></div>
          <div className="product-plan-grid">{product.plans.map((plan) => <article className={plan.featured ? "featured" : ""} key={plan.name}>{plan.featured && <span className="product-plan-badge">{en ? "RECOMMENDED" : "REKOMENDASI"}</span>}<h3>{plan.name}</h3><p>{plan.description}</p><div><strong>{plan.price}</strong><small>{plan.unit}</small></div><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href={localePath(locale, "/#contact")}>{en ? "Discuss this plan" : "Diskusikan paket"} <span>↗</span></Link></article>)}</div>
          <p className="product-disclaimer">{product.disclaimer}</p>
        </section>

        <section className="product-lifecycle">
          <span className="kicker">CONTROLLED ACCESS</span>
          <h2>{en ? "Payment verified." : "Pembayaran terverifikasi."}<br /><em>{en ? "Access updated automatically." : "Akses diperbarui otomatis."}</em></h2>
          <div>{["Trial", "Active", "Past due", "Grace period", "Suspended", "Cancelled"].map((status, index) => <span key={status}><b>0{index + 1}</b>{status}</span>)}</div>
          <p>{en ? "Activation and renewal will be driven by a verified payment-provider webhook—not by an untrusted browser redirect." : "Aktivasi dan perpanjangan akan dijalankan oleh webhook payment provider yang terverifikasi—bukan redirect browser yang tidak tepercaya."}</p>
        </section>

        <section className="product-cta"><span className="kicker">PILOT PROGRAM</span><h2>{en ? "Validate the workflow." : "Validasi workflow."}<br /><em>{en ? "Then expand." : "Lalu kembangkan."}</em></h2><p>{en ? "We begin with a bounded pilot, define measurable success criteria, and only scale after the operational flow is proven." : "Kami mulai dari pilot dengan scope terbatas, menetapkan tolok ukur keberhasilan, lalu melakukan scale setelah alur operasional terbukti."}</p><Link className="button button-primary" href={localePath(locale, "/#contact")}>{en ? "Plan a pilot" : "Rencanakan pilot"} <span>↗</span></Link></section>
      </article>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
