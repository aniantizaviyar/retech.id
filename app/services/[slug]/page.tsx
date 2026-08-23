import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "../../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getService, services } from "@/lib/services";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const service = getService((await params).slug, locale);
  if (!service) return { title: "Service" };
  const basePath = `/services/${service.slug}`;
  const path = localePath(locale, basePath);
  return {
    title: service.shortTitle,
    description: service.summary,
    alternates: { canonical: path, languages: languageAlternates(basePath) },
    openGraph: { type: "website", url: path, title: `${service.title} | RETECH`, description: service.summary, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: `${service.title} | RETECH`, description: service.summary, images: ["/og.png"] },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const locale = await getLocale();
  const en = locale === "en";
  const service = getService((await params).slug, locale);
  if (!service) notFound();
  const pageUrl = absoluteLocaleUrl(locale, `/services/${service.slug}`);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: service.title,
    serviceType: service.shortTitle,
    description: service.summary,
    url: pageUrl,
    provider: { "@id": "https://retech.id/#organization" },
    areaServed: { "@type": "Country", name: "Indonesia" },
    audience: { "@type": "BusinessAudience", audienceType: "Business and organization" },
    inLanguage: localeConfig[locale].schemaLang,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : "Beranda", item: absoluteLocaleUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: en ? "Services" : "Layanan", item: absoluteLocaleUrl(locale, "/services") },
      { "@type": "ListItem", position: 3, name: service.shortTitle, item: pageUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />
      <article className="service-detail">
        <header className="service-detail-hero">
          <Link className="back-link" href={localePath(locale, "/services")}>← {en ? "All services" : "Semua layanan"}</Link>
          <span className="kicker">{service.eyebrow} / RETECH SERVICE</span>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
          <div className="hero-actions"><Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source={service.slug}>{en ? "Discuss your needs" : "Diskusikan kebutuhan"} <span>↗</span></Link><Link className="button button-secondary" href={localePath(locale, "/pricing")}>{en ? "View pricing" : "Lihat pricing"} <span>↗</span></Link></div>
        </header>

        <section className="service-detail-grid">
          <div><span className="kicker">WHAT&apos;S INCLUDED</span><h2>{en ? "A scope built" : "Scope yang dapat"}<br /><em>{en ? "around your needs." : "disesuaikan."}</em></h2></div>
          <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="service-outcomes">
          {service.outcomes.map((outcome, index) => <article key={outcome}><span>0{index + 1}</span><strong>{outcome}</strong></article>)}
        </section>

        <section className="service-process">
          <div className="pricing-heading"><div><span className="kicker">HOW WE DELIVER</span><h2>Clear steps.<br /><em>Controlled execution.</em></h2></div><p>{en ? "Work details, dependencies, timeline, and expected outcomes are confirmed before execution." : "Detail pekerjaan, dependensi, timeline, dan hasil yang diharapkan dikonfirmasi sebelum eksekusi."}</p></div>
          <ol>{service.process.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
        </section>

        <section className="service-fit">
          <div><span className="kicker">BEST FIT</span><h2>{en ? "Designed for" : "Dirancang untuk"}<br /><em>{en ? "real business needs." : "kebutuhan nyata."}</em></h2></div>
          <ul>{service.bestFor.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="service-related">
          <span className="kicker">RELATED CASE STUDIES</span>
          <div>{service.relatedWork.map((work) => <Link key={work.href} href={localePath(locale, work.href)}>{work.label}<span>↗</span></Link>)}</div>
        </section>

        <section className="service-bottom-cta">
          <span className="kicker">NEXT STEP</span><h2>Scope it right.<br /><em>Build it with confidence.</em></h2>
          <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source={`${service.slug}_bottom`}>{en ? "Start a consultation" : "Mulai konsultasi"} <span>↗</span></Link>
        </section>
      </article>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
