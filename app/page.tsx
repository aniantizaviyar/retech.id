import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChatWidget } from "./ChatWidget";
import { LeadForm } from "./LeadForm";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteFooter } from "@/components/SiteFooter";
import { companyContact } from "@/lib/company";
import { SiteHeader } from "@/components/SiteHeader";
import { getProjects } from "@/lib/projects";
import { languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/");
  const description = en
    ? "PT. Retech Digital Solution builds digital products, manages IT infrastructure, and delivers server solutions for businesses."
    : "PT. Retech Digital Solution membangun produk digital, mengelola infrastruktur IT, dan menangani deployment server untuk bisnis.";
  return {
    title: { absolute: "RETECH — IT Solutions That Move Business Forward" },
    description,
    alternates: { canonical, languages: languageAlternates("/") },
    openGraph: { type: "website", url: canonical, title: "RETECH — IT Solutions That Move Business Forward", description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "RETECH Digital Solution" }] },
    twitter: { card: "summary_large_image", title: "RETECH — IT Solutions That Move Business Forward", description, images: ["/og.png"] },
  };
}

const services = [
  {
    number: "01",
    eyebrow: "BUILD",
    title: "Digital Product & Application Development",
    description:
      "Dari company profile hingga aplikasi bisnis, kami merancang produk digital yang cepat, aman, dan siap bertumbuh.",
    items: ["Company Profile", "CMS", "Web App", "Android", "iOS", "API Integration"],
    value: "Launch faster. Work smarter.",
    href: "/services/digital-product-development",
  },
  {
    number: "02",
    eyebrow: "OPERATE",
    title: "Managed Infrastructure & IT Operations",
    description:
      "Kami menjaga server, jaringan, data, dan support harian agar operasional bisnis tetap stabil dan terukur.",
    items: ["Server Maintenance", "Monitoring", "Infrastructure", "Helpdesk", "Backup & Restore"],
    value: "Visibility, uptime, continuity.",
    href: "/services/managed-it-services",
  },
  {
    number: "03",
    eyebrow: "DEPLOY",
    title: "Remote IT & Server Deployment",
    description:
      "Instalasi, konfigurasi, troubleshooting, dan hardening sistem oleh tim teknis tanpa menunggu kunjungan onsite.",
    items: ["Remote Support", "Server Installation", "Configuration", "Migration", "Hardening"],
    value: "Expert help, wherever you are.",
    href: "/services/remote-server-support",
  },
];

const englishServices = [
  { ...services[0], description: "From company profiles to business applications, we design fast, secure digital products that are ready to grow." },
  { ...services[1], description: "We maintain servers, networks, data, and day-to-day support so business operations remain stable and measurable." },
  { ...services[2], description: "Remote installation, configuration, troubleshooting, and hardening by technical specialists without waiting for an onsite visit." },
];

export default async function Home() {
  const locale = await getLocale();
  const en = locale === "en";
  const projects = (await getProjects(locale)).filter((project) => project.featured).slice(0, 4);
  const homeServices = en ? englishServices : services;

  return (
    <main>
      <SiteHeader locale={locale} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="status-pill"><span /> Your IT partner for what&apos;s next</div>
          <h1>
            Technology that works.<br />
            <em>Business that grows.</em>
          </h1>
          <p>
            {en
              ? "RETECH helps businesses build digital products, maintain infrastructure, and solve IT challenges—from idea to daily operations."
              : "RETECH membantu bisnis membangun produk digital, menjaga infrastruktur, dan menyelesaikan tantangan IT—dari ide hingga operasional."}
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact" data-analytics="contact_cta_click" data-analytics-source="home_hero">{en ? "Start a project" : "Mulai project"} <span>↗</span></a>
            <Link className="button button-secondary" href={localePath(locale, "/work")}>{en ? "View our work" : "Lihat hasil kerja"} <span>↘</span></Link>
          </div>
          <div className="trust-row">
            <span>DIGITAL PRODUCT</span><i />
            <span>MANAGED OPERATIONS</span><i />
            <span>SERVER DEPLOYMENT</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-core">
            <Image src="/retech-logo-transparent.png" alt="" width={500} height={430} priority />
          </div>
          <div className="floating-card card-top"><span>UPTIME</span><strong>Always on</strong></div>
          <div className="floating-card card-bottom"><span>SOLUTION</span><strong>Built to fit</strong></div>
          <div className="signal-dot dot-one" />
          <div className="signal-dot dot-two" />
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <span className="kicker">WHAT WE DO</span>
            <h2>One partner.<br /><em>Every layer of IT.</em></h2>
          </div>
          <p>{en ? "Three service lines connecting product development, operational stability, and technical support into one solution." : "Tiga lini layanan yang menghubungkan pembangunan produk, stabilitas operasional, dan dukungan teknis menjadi satu solusi."}</p>
        </div>

        <div className="service-grid">
          {homeServices.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-topline">
                <span>{service.eyebrow}</span>
                <span className="service-number">{service.number}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <strong className="service-value">{service.value}</strong>
              <div className="service-tags">
                {service.items.map((item) => <span key={item}>{item}</span>)}
              </div>
              <Link href={localePath(locale, service.href)} aria-label={`${en ? "View" : "Lihat"} ${service.title}`} data-analytics="service_detail_click" data-analytics-source="home_service_card">
                {en ? "View service details" : "Lihat detail layanan"} <span>↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="featured-work" id="work">
        <div className="section-heading">
          <div>
            <span className="kicker">SELECTED WORK</span>
            <h2>Built for real<br /><em>operations.</em></h2>
          </div>
          <div className="section-side-copy">
            <p>{en ? "Selected website, business application, HRMS, and monitoring implementations from active systems." : "Implementasi website, aplikasi bisnis, HRMS, dan monitoring yang dipilih dari sistem aktif."}</p>
            <span className="privacy-note">{en ? "Client identity protected by confidentiality" : "Identitas customer dilindungi oleh kerahasiaan"}</span>
          </div>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => <ProjectCard key={project.slug} project={project} locale={locale} index={index} />)}
        </div>
        <Link className="work-link" href={localePath(locale, "/work")}>{en ? "Explore all case studies" : "Lihat semua case study"} <span>↗</span></Link>
      </section>

      <section className="approach-section" id="approach">
        <div className="approach-panel">
          <div className="approach-copy">
            <span className="kicker">HOW WE WORK</span>
            <h2>Clear process.<br /><em>Measurable impact.</em></h2>
            <p>{en ? "We start with the business need, shape the right solution, and keep the outcome performing at its best." : "Kami mulai dari kebutuhan bisnis, menyusun solusi yang tepat, lalu menjaga hasilnya tetap optimal."}</p>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><strong>Discover</strong><p>{en ? "Understand goals, challenges, users, and the systems already in place." : "Memahami tujuan, tantangan, pengguna, dan sistem yang sudah berjalan."}</p></div></li>
            <li><span>02</span><div><strong>Design &amp; Deliver</strong><p>{en ? "Design the solution, build iteratively, and test critical functions." : "Merancang solusi, mengembangkan secara iteratif, dan menguji bagian penting."}</p></div></li>
            <li><span>03</span><div><strong>Operate &amp; Improve</strong><p>{en ? "Monitor, support, and continuously improve performance." : "Memantau, mendukung, dan meningkatkan performa secara berkelanjutan."}</p></div></li>
          </ol>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-glow" />
        <div className="contact-inner">
          <div className="contact-copy">
            <span className="kicker">LET&apos;S BUILD WHAT&apos;S NEXT</span>
            <h2>Ready to move your<br /><em>business forward?</em></h2>
            <p>{en ? "Tell us about your IT needs. Your inquiry will be stored securely and the RETECH team will contact you about the next step." : "Ceritakan kebutuhan IT Anda. Inquiry akan tersimpan dengan aman dan tim RETECH akan menghubungi Anda untuk langkah berikutnya."}</p>
            <div className="contact-note"><span>01</span><p>{en ? "Select a service and describe what you need." : "Pilih layanan dan jelaskan kebutuhan Anda."}</p></div>
            <div className="contact-note"><span>02</span><p>{en ? "Our team reviews the scope and contacts you." : "Tim kami meninjau scope dan menghubungi Anda."}</p></div>
            <div className="contact-note"><span>03</span><p>{en ? "We prepare a relevant solution and estimate." : "Kami susun solusi serta estimasi yang relevan."}</p></div>
            <div className="contact-direct">
              <a className="contact-direct-link" href={`mailto:${companyContact.email}`}>
                <span>EMAIL</span>{companyContact.email} <b>↗</b>
              </a>
              <a
                className="contact-direct-link"
                href={en ? companyContact.whatsappUrlEn : companyContact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                data-analytics="whatsapp_click"
                data-analytics-source="home_contact"
              >
                <span>WHATSAPP · {en ? "CHAT ONLY" : "HANYA CHAT"}</span>{companyContact.whatsappDisplay} <b>↗</b>
              </a>
              <a className="contact-direct-link contact-address" href={companyContact.mapUrl} target="_blank" rel="noreferrer">
                <span>{en ? "BUSINESS ADDRESS · VISIT BY APPOINTMENT" : "ALAMAT BISNIS · KUNJUNGAN DENGAN JANJI"}</span>{companyContact.address} <b>↗</b>
              </a>
            </div>
          </div>
          <div className="contact-form-card">
            <span className="contact-form-label">PROJECT INQUIRY</span>
            <h3>{en ? "Tell us what you need." : "Ceritakan kebutuhan Anda."}</h3>
            <LeadForm source="contact" locale={locale} />
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
