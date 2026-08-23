import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { companyContact } from "@/lib/company";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Kenali PT. Retech Digital Solution, partner teknologi B2B untuk digital product development, managed IT operations, dan server deployment.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About RETECH | PT. Retech Digital Solution",
    description:
      "Technology partner yang menyatukan kebutuhan bisnis, delivery yang terukur, dan keamanan sejak tahap perancangan.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About RETECH | PT. Retech Digital Solution",
    images: ["/og.png"],
  },
};

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

export default function AboutPage() {
  const pageUrl = "https://retech.id/about";
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${pageUrl}#about`,
    url: pageUrl,
    name: "About RETECH",
    description:
      "Profil PT. Retech Digital Solution dan prinsip kerja RETECH sebagai partner teknologi B2B.",
    inLanguage: "id-ID",
    mainEntity: { "@id": "https://retech.id/#organization" },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://retech.id" },
      { "@type": "ListItem", position: 2, name: "About Us", item: pageUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader />

      <section className="about-hero">
        <div>
          <span className="kicker">ABOUT RETECH</span>
          <h1>Technology with<br /><em>business context.</em></h1>
        </div>
        <div className="about-hero-copy">
          <p>
            PT. Retech Digital Solution—RETECH—adalah partner teknologi B2B yang
            membantu bisnis membangun produk digital, menjaga infrastruktur, dan
            menyelesaikan kebutuhan server secara terarah.
          </p>
          <span>BUILD · OPERATE · SUPPORT</span>
        </div>
      </section>

      <section className="about-statement">
        <span className="about-index">01 / OUR PURPOSE</span>
        <div>
          <h2>Teknologi harus mempermudah operasi—<em>bukan menambah kompleksitas.</em></h2>
          <p>
            Misi kami adalah menerjemahkan kebutuhan bisnis menjadi solusi digital
            yang relevan, aman, dapat dipelihara, dan siap berkembang. Kami
            menggabungkan product development, infrastructure operations, serta
            server expertise agar keputusan teknis tetap terhubung dengan hasil bisnis.
          </p>
        </div>
      </section>

      <section className="about-principles">
        <div className="about-section-heading">
          <div>
            <span className="kicker">HOW WE THINK</span>
            <h2>Principles that<br /><em>guide the work.</em></h2>
          </div>
          <p>Prinsip kerja yang menjaga kualitas delivery, kejelasan kolaborasi, dan kepercayaan jangka panjang.</p>
        </div>
        <div className="principle-grid">
          {principles.map((principle) => (
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
          <p>
            RETECH menghubungkan tiga lapisan yang sering ditangani terpisah:
            pembangunan produk, stabilitas operasional, dan dukungan teknis.
          </p>
          <Link className="button button-secondary" href="/services">Explore services <span>↗</span></Link>
        </div>
        <div className="capability-list">
          {capabilities.map(([title, copy], index) => (
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
          <p>Kunjungan ke business address dilakukan berdasarkan janji temu.</p>
        </div>
        <address>
          <a href={companyContact.mapUrl} target="_blank" rel="noreferrer">
            <span>BUSINESS ADDRESS</span>
            {companyContact.address}
            <b>Open Maps ↗</b>
          </a>
          <a
            href={companyContact.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            data-analytics="whatsapp_click"
            data-analytics-source="about_company_info"
          >
            <span>WHATSAPP · CHAT ONLY</span>
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
            <p>
              Kami mengutamakan kerahasiaan informasi customer, akses berbasis
              kebutuhan, dokumentasi, dan handover yang jelas. Teknologi dipilih
              sesuai konteks—bukan karena tren semata—dengan perhatian pada
              keamanan, performa, biaya operasional, dan kemampuan pengembangan berikutnya.
            </p>
            <Link href="/privacy-policy">Baca Kebijakan Privasi <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="service-bottom-cta">
        <span className="kicker">LET&apos;S WORK TOGETHER</span>
        <h2>Bring the challenge.<br /><em>We&apos;ll map the solution.</em></h2>
        <div>
          <Link className="button button-primary" href="/#contact" data-analytics="contact_cta_click" data-analytics-source="about">
            Start a conversation <span>↗</span>
          </Link>
          <Link className="button button-secondary" href="/work">View case studies <span>↗</span></Link>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
