import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { companyContact } from "@/lib/company";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPageContent } from "@/lib/cms-data";
import companyProfile from "@/lib/company-profile.json";
import styles from "./about.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/about");
  const description = en ? "Explore RETECH's company profile: web and mobile development, managed IT, migration and hardening, VPS, ReTendance, QR Order & POS, and anonymized case studies." : "Profil RETECH: pengembangan web dan mobile, managed IT, migrasi dan hardening, VPS, ReTendance, QR Order & POS, serta case studies anonim.";
  return { title: "About Us", description, alternates: { canonical, languages: languageAlternates("/about") }, openGraph: { type: "website", url: canonical, title: "About RETECH | PT. Retech Digital Solution", description, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: "About RETECH | PT. Retech Digital Solution", description, images: ["/og.png"] } };
}

const principles = [
  {
    number: "01",
    title: "Business before technology",
    copy: "Kami mulai dari tujuan, risiko, pengguna, dan proses operasional—baru menentukan arsitektur serta teknologi yang tepat.",
  },
  {
    number: "02",
    title: "Security by design",
    copy: "Validasi, kontrol akses, perlindungan data, hardening, dan observability dipertimbangkan sejak awal, bukan ditambahkan menjelang rilis.",
  },
  {
    number: "03",
    title: "Clarity in delivery",
    copy: "Scope, asumsi, prioritas, biaya, dan handover dibahas secara terbuka agar setiap keputusan dapat dipahami dan dipertanggungjawabkan.",
  },
  {
    number: "04",
    title: "Built to operate",
    copy: "Solusi dirancang agar dapat dipelihara, dipantau, dan dikembangkan setelah go-live—bukan hanya terlihat baik saat demo.",
  },
];

const englishPrinciples = [
  { number: "01", title: "Business before technology", copy: "We begin with goals, risks, users, and operational processes before selecting the right architecture and technology." },
  { number: "02", title: "Security by design", copy: "Validation, access control, data protection, hardening, and observability are considered from the start—not added just before launch." },
  { number: "03", title: "Clarity in delivery", copy: "Scope, assumptions, priorities, costs, and handover are discussed openly so each decision can be understood and accounted for." },
  { number: "04", title: "Built to operate", copy: "Solutions are designed to be maintained, monitored, and extended after go-live—not only to look good in a demo." },
];

export default async function AboutPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const localizedPrinciples = en ? englishPrinciples : principles;
  const profile = en ? companyProfile.en : companyProfile.id;
  const pageContent = await getPageContent("about", locale);
  const pageUrl = absoluteLocaleUrl(locale, "/about");
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${pageUrl}#about`,
    url: pageUrl,
    name: "About RETECH",
    description:
      en ? "Profile of PT. Retech Digital Solution and the principles behind RETECH as a B2B technology partner." : "Profil PT. Retech Digital Solution dan prinsip kerja RETECH sebagai partner teknologi B2B.",
    inLanguage: localeConfig[locale].schemaLang,
    mainEntity: { "@id": "https://retech.id/#organization" },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : "Beranda", item: absoluteLocaleUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: "About Us", item: pageUrl },
    ],
  };

  return (
    <main className="public-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />

      <section className="about-hero">
        <div>
          <span className="kicker">ABOUT RETECH</span>
          <h1>{String(pageContent.heroTitle || "Technology with")}<br /><em>{String(pageContent.heroTitleAccent || "business context.")}</em></h1>
        </div>
        <div className="about-hero-copy">
          <p>{String(pageContent.heroIntro || "")}</p>
          <span>BUILD · OPERATE · SUPPORT</span>
          <div className={styles.actions}>
            <a className="button button-primary" href={companyProfile.download} download>{en ? "Download company profile" : "Unduh company profile"} <span aria-hidden="true">↓</span></a>
            <a className="button button-secondary" href="#company-products">{en ? "Our products" : "Produk kami"} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="company-profile-heading">
        <span className="kicker">COMPANY AT A GLANCE</span>
        <h2 id="company-profile-heading">{en ? "Technology connected to " : "Teknologi yang terhubung dengan "}<em>{en ? "your business." : "bisnis Anda."}</em></h2>
        <p>{profile.intro}</p>
        <div className={styles.summary}>
          <div><strong>{companyProfile.experience}</strong><span>{en ? "Years of technical experience" : "Tahun pengalaman teknis"}</span><small>{profile.experienceNote}</small></div>
          <div><strong>4</strong><span>{en ? "Connected service areas" : "Area layanan terhubung"}</span><small>Development / Managed IT / Deployment / VPS</small></div>
          <div><strong>Bekasi</strong><span>Indonesia</span><small>{en ? "Business visits by appointment." : "Kunjungan bisnis berdasarkan janji temu."}</small></div>
        </div>
        <div className={styles.missionGrid}>
          <div><h3>{en ? "Our vision" : "Visi kami"}</h3><p>{profile.vision}</p></div>
          <div><h3>{en ? "Our mission" : "Misi kami"}</h3><ul>{profile.mission.map(item => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="about-statement">
        <span className="about-index">01 / OUR PURPOSE</span>
        <div>
          <h2>{String(pageContent.purposeTitle || "")}<em>{String(pageContent.purposeTitleAccent || "")}</em></h2>
          <p>{String(pageContent.purposeCopy || "")}</p>
        </div>
      </section>

      <section className="about-principles">
        <div className="about-section-heading">
          <div>
            <span className="kicker">HOW WE THINK</span>
            <h2>Principles that<br /><em>guide the work.</em></h2>
          </div>
          <p>{String(pageContent.principlesIntro || "")}</p>
        </div>
        <div className="principle-grid">
          {localizedPrinciples.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-capabilities">
        <div>
          <span className="kicker">WHAT WE CONNECT</span>
          <h2>From idea to<br /><em>daily operations.</em></h2>
          <p>{en ? "From websites and business applications to infrastructure operations, server migration, hardening, and VPS. Each engagement follows a defined scope." : "Dari website dan aplikasi bisnis hingga pengelolaan infrastruktur, migrasi, hardening server, serta VPS. Setiap pekerjaan mengikuti ruang lingkup yang disepakati."}</p>
          <Link className="button button-secondary" href={localePath(locale, "/services")}>{en ? "Explore services" : "Jelajahi layanan"} <span>↗</span></Link>
        </div>
        <div className="capability-list">
          {profile.services.map((service, index) => (
            <article key={service.href}>
              <span>0{index + 1}</span>
              <div><h3>{service.title}</h3><p>{service.summary}</p><ul className={styles.serviceScope}>{service.scope.map(item => <li key={item}>{item}</li>)}</ul><Link className={styles.serviceLink} href={localePath(locale, service.href)}>{en ? "Explore this service" : "Lihat detail layanan"} <span aria-hidden="true">↗</span></Link></div>
            </article>
          ))}
        </div>
      </section>

      <section id="company-products" className={styles.section} aria-labelledby="company-products-heading">
        <span className="kicker">RETECH PRODUCTS</span>
        <h2 id="company-products-heading">{en ? "Software for " : "Software untuk "}<em>{en ? "daily operations." : "operasional nyata."}</em></h2>
        <div className={styles.productGrid}>
          {profile.products.map((product, index) => <article className={styles.product} key={product.href}>
            <span className={styles.badge}>{product.status}</span>
            <h3>{product.title}</h3><p>{product.summary}</p>
            <ul>{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            <small>{product.note}</small>
            <div className={styles.actions}>
              <Link className="button button-secondary" href={localePath(locale, product.href)}>{en ? "Product details" : "Detail produk"} <span aria-hidden="true">↗</span></Link>
              {index === 0 && <a className={styles.serviceLink} href="https://play.google.com/store/apps/details?id=com.absen.project" target="_blank" rel="noopener noreferrer">Google Play <span aria-hidden="true">↗</span></a>}
            </div>
          </article>)}
        </div>
        <p className={styles.note}>{profile.subscriptionNote}</p>
      </section>

      <section className={styles.section} aria-labelledby="company-cases-heading">
        <span className="kicker">SELECTED CASE STUDIES</span>
        <h2 id="company-cases-heading">{en ? "Built for " : "Dibangun untuk "}<em>{en ? "real work." : "kebutuhan kerja."}</em></h2>
        <p>{profile.privacyNote}</p>
        <div className={styles.caseGrid}>
          {profile.cases.map(project => <article className={styles.case} key={project.href}>
            <Image src={project.image} alt={`${en ? "Conceptual illustration" : "Ilustrasi konseptual"}: ${project.title}`} width={960} height={540} sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 600px" />
            <div className={styles.caseBody}><h3>{project.title}</h3><p>{project.summary}</p><p>{project.outcome}</p><small>{project.tags}</small><Link className={styles.serviceLink} href={localePath(locale, project.href)}>{en ? "Read case study" : "Baca case study"} <span aria-hidden="true">↗</span></Link></div>
          </article>)}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="company-process-heading">
        <span className="kicker">HOW WE DELIVER</span>
        <h2 id="company-process-heading">{en ? "Clear scope. " : "Scope jelas. "}<em>{en ? "A deliberate next step." : "Langkah terarah."}</em></h2>
        <div className={styles.process}>{profile.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
      </section>

      <section className="about-company-info">
        <div>
          <span className="kicker">COMPANY INFORMATION</span>
          <h2>Reach RETECH.<br /><em>Start with a conversation.</em></h2>
          <p>{String(pageContent.companyIntro || "")}</p>
          <a
            className="button button-secondary"
            href={companyProfile.download}
            download
          >
            {en ? "Download company profile" : "Unduh company profile"} <span>↓</span>
          </a>
          <small className={styles.downloadMeta}>{en ? "Indonesian PDF · Updated 29 October 2026" : "PDF Bahasa Indonesia · Diperbarui 29 Oktober 2026"}</small>
        </div>
        <address>
          <a href={companyContact.mapUrl} target="_blank" rel="noopener noreferrer">
            <span>{en ? "BUSINESS ADDRESS" : "ALAMAT BISNIS"}</span>
            {companyContact.address}
            <b>Open Maps ↗</b>
          </a>
          <a
            href={en ? companyContact.whatsappUrlEn : companyContact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            data-analytics-source="about_company_info"
          >
            <span>WHATSAPP · {en ? "CHAT ONLY" : "HANYA CHAT"}</span>
            {companyContact.whatsappDisplay}
            <b>Start chat ↗</b>
          </a>
          <a href={`mailto:${companyContact.email}`}>
            <span>EMAIL</span>
            {companyContact.email}
            <b>Send email ↗</b>
          </a>
        </address>
      </section>

      <section className="about-trust">
        <span className="kicker">BUILT ON TRUST</span>
        <div className="about-trust-grid">
          <h2>Your system.<br /><em>Your data. Your control.</em></h2>
          <div>
            <p>{String(pageContent.trustCopy || "")}</p>
            <Link href={localePath(locale, "/privacy-policy")}>{en ? "Read our Privacy Policy" : "Baca Kebijakan Privasi"} <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="service-bottom-cta">
        <span className="kicker">LET&apos;S WORK TOGETHER</span>
        <h2>Bring the challenge.<br /><em>We&apos;ll map the solution.</em></h2>
        <div>
          <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="about">
            {en ? "Start a conversation" : "Mulai percakapan"} <span>↗</span>
          </Link>
          <Link className="button button-secondary" href={localePath(locale, "/work")}>{en ? "View case studies" : "Lihat case study"} <span>↗</span></Link>
        </div>
      </section>

      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
