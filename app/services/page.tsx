import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getServices } from "@/lib/services";
import { absoluteLocaleUrl, languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/services");
  const description = en ? "Website and application development, Managed IT Services, remote support, installation, configuration, and server solutions from RETECH." : "Layanan website dan aplikasi, Managed IT Services, remote support, instalasi, konfigurasi, dan solusi server RETECH.";
  return { title: "IT Services", description, alternates: { canonical, languages: languageAlternates("/services") }, openGraph: { type: "website", url: canonical, title: "IT Services | RETECH", description, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: "IT Services | RETECH", description, images: ["/og.png"] } };
}

export default async function ServicesPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const services = getServices(locale);
  const pageUrl = absoluteLocaleUrl(locale, "/services");
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
        url: absoluteLocaleUrl(locale, `/services/${service.slug}`),
        itemOffered: {
          "@type": "Service",
          "@id": `${absoluteLocaleUrl(locale, `/services/${service.slug}`)}#service`,
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
      <SiteHeader locale={locale} />
      <section className="service-page-hero">
        <span className="kicker">RETECH SERVICES</span>
        <h1>Build. Operate.<br /><em>Move forward.</em></h1>
        <p>{en ? "One partner to build digital products, maintain infrastructure, and deliver server solutions with a clear direction." : "Satu partner untuk membangun produk digital, menjaga infrastruktur, dan menyelesaikan kebutuhan server secara terarah."}</p>
      </section>
      <section className="service-directory" aria-label={en ? "RETECH services" : "Daftar layanan RETECH"}>
        {services.map((service, index) => (
          <article className="service-directory-card" key={service.slug}>
            <div className="service-directory-index">0{index + 1} / {service.eyebrow}</div>
            <h2>{service.title}</h2>
            <p>{service.summary}</p>
            <ul>{service.includes.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
            <Link href={localePath(locale, `/services/${service.slug}`)} data-analytics="service_detail_click" data-analytics-source="services_directory">
              {en ? "View service details" : "Lihat detail layanan"} <span>↗</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="service-bottom-cta">
        <span className="kicker">NOT SURE WHERE TO START?</span>
        <h2>{en ? "Tell us where you are." : "Ceritakan kondisi Anda."}<br /><em>{en ? "We'll map the way forward." : "Kami bantu petakan."}</em></h2>
        <div><Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="services">{en ? "Discuss your needs" : "Konsultasi kebutuhan"} <span>↗</span></Link><Link className="button button-secondary" href={localePath(locale, "/faq")}>{en ? "Read FAQ" : "Baca FAQ"} <span>↗</span></Link></div>
      </section>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
