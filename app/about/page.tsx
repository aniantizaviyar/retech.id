import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { companyContact } from "@/lib/company";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPageContent } from "@/lib/cms-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/about");
  const description = en ? "Meet PT. Retech Digital Solution, a B2B technology partner for digital product development, managed IT operations, and server deployment." : "Kenali PT. Retech Digital Solution, partner teknologi B2B untuk digital product development, managed IT operations, dan server deployment.";
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

const capabilities = [
  ["Digital Product", "Company profile, CMS, web application, API, Android, dan iOS."],
  ["Managed Operations", "Server maintenance, monitoring, helpdesk, backup, dan pemulihan data."],
  ["Server Deployment", "Instalasi, konfigurasi, migrasi, troubleshooting, dan hardening."],
];

const englishPrinciples = [
  { number: "01", title: "Business before technology", copy: "We begin with goals, risks, users, and operational processes before selecting the right architecture and technology." },
  { number: "02", title: "Security by design", copy: "Validation, access control, data protection, hardening, and observability are considered from the start—not added just before launch." },
  { number: "03", title: "Clarity in delivery", copy: "Scope, assumptions, priorities, costs, and handover are discussed openly so each decision can be understood and accounted for." },
  { number: "04", title: "Built to operate", copy: "Solutions are designed to be maintained, monitored, and extended after go-live—not only to look good in a demo." },
];

const englishCapabilities = [
  ["Digital Product", "Company profiles, CMS platforms, web applications, APIs, Android, and iOS."],
  ["Managed Operations", "Server maintenance, monitoring, helpdesk, backup, and data recovery."],
  ["Server Deployment", "Installation, configuration, migration, troubleshooting, and hardening."],
];

export default async function AboutPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const localizedPrinciples = en ? englishPrinciples : principles;
  const localizedCapabilities = en ? englishCapabilities : capabilities;
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
    <main>
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
          <p>{String(pageContent.capabilitiesIntro || "")}</p>
          <Link className="button button-secondary" href={localePath(locale, "/services")}>{en ? "Explore services" : "Jelajahi layanan"} <span>↗</span></Link>
        </div>
        <div className="capability-list">
          {localizedCapabilities.map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-company-info">
        <div>
          <span className="kicker">COMPANY INFORMATION</span>
          <h2>Reach RETECH.<br /><em>Start with a conversation.</em></h2>
          <p>{String(pageContent.companyIntro || "")}</p>
        </div>
        <address>
          <a href={companyContact.mapUrl} target="_blank" rel="noreferrer">
            <span>{en ? "BUSINESS ADDRESS" : "ALAMAT BISNIS"}</span>
            {companyContact.address}
            <b>Open Maps ↗</b>
          </a>
          <a
            href={en ? companyContact.whatsappUrlEn : companyContact.whatsappUrl}
            target="_blank"
            rel="noreferrer"
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
