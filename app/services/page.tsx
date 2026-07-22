import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "IT Services",
  description: "Layanan website dan aplikasi, Managed IT Services, remote support, instalasi, konfigurasi, dan solusi server RETECH.",
  alternates: { canonical: "/services" },
  openGraph: { type: "website", url: "/services", title: "IT Services | RETECH", description: "Solusi digital, managed infrastructure, dan server support untuk bisnis.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "IT Services | RETECH", images: ["/og.png"] },
};

export default function ServicesPage() {
  const pageUrl = "https://retech.id/services";
  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${pageUrl}#catalog`,
    name: "RETECH IT Services",
    url: pageUrl,
    itemListElement: services.map((service) => ({
      "@type": "OfferCatalog",
      name: service.shortTitle,
      itemListElement: [{
        "@type": "Offer",
        url: `${pageUrl}/${service.slug}`,
        itemOffered: {
          "@type": "Service",
          "@id": `${pageUrl}/${service.slug}#service`,
          name: service.title,
          description: service.summary,
          provider: { "@id": "https://retech.id/#organization" },
          areaServed: { "@type": "Country", name: "Indonesia" },
        },
      }],
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <section className="service-page-hero">
        <span className="kicker">RETECH SERVICES</span>
        <h1>Build. Operate.<br /><em>Move forward.</em></h1>
        <p>Satu partner untuk membangun produk digital, menjaga infrastruktur, dan menyelesaikan kebutuhan server secara terarah.</p>
      </section>
      <section className="service-directory" aria-label="Daftar layanan RETECH">
        {services.map((service, index) => (
          <article className="service-directory-card" key={service.slug}>
            <div className="service-directory-index">0{index + 1} / {service.eyebrow}</div>
            <h2>{service.title}</h2>
            <p>{service.summary}</p>
            <ul>{service.includes.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
            <Link href={`/services/${service.slug}`} data-analytics="service_detail_click" data-analytics-source="services_directory">
              Lihat detail layanan <span>↗</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="service-bottom-cta">
        <span className="kicker">NOT SURE WHERE TO START?</span>
        <h2>Ceritakan kondisi Anda.<br /><em>Kami bantu petakan.</em></h2>
        <div><Link className="button button-primary" href="/#contact" data-analytics="contact_cta_click" data-analytics-source="services">Konsultasi kebutuhan <span>↗</span></Link><Link className="button button-secondary" href="/faq">Baca FAQ <span>↗</span></Link></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
