import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChatWidget } from "./ChatWidget";
import { LeadForm } from "./LeadForm";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: { absolute: "RETECH — IT Solutions That Move Business Forward" },
  description:
    "PT. Retech Digital Solution membangun produk digital, mengelola infrastruktur IT, dan menangani deployment server untuk bisnis.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "RETECH — IT Solutions That Move Business Forward",
    description: "Website, aplikasi, managed IT, dan solusi server untuk membantu bisnis bergerak lebih cepat.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RETECH Digital Solution" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RETECH — IT Solutions That Move Business Forward",
    description: "Website, aplikasi, managed IT, dan solusi server untuk bisnis.",
    images: ["/og.png"],
  },
};

const services = [
  {
    number: "01",
    eyebrow: "BUILD",
    title: "Digital Product & Application Development",
    description:
      "Dari company profile hingga aplikasi bisnis, kami merancang produk digital yang cepat, aman, dan siap bertumbuh.",
    items: ["Company Profile", "CMS", "Web App", "Android", "iOS", "API Integration"],
    value: "Launch faster. Work smarter.",
  },
  {
    number: "02",
    eyebrow: "OPERATE",
    title: "Managed Infrastructure & IT Operations",
    description:
      "Kami menjaga server, jaringan, data, dan support harian agar operasional bisnis tetap stabil dan terukur.",
    items: ["Server Maintenance", "Monitoring", "Infrastructure", "Helpdesk", "Backup & Restore"],
    value: "Visibility, uptime, continuity.",
  },
  {
    number: "03",
    eyebrow: "DEPLOY",
    title: "Remote IT & Server Deployment",
    description:
      "Instalasi, konfigurasi, troubleshooting, dan hardening sistem oleh tim teknis tanpa menunggu kunjungan onsite.",
    items: ["Remote Support", "Server Installation", "Configuration", "Migration", "Hardening"],
    value: "Expert help, wherever you are.",
  },
];

export default async function Home() {
  const projects = (await getProjects()).filter((project) => project.featured).slice(0, 4);

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="status-pill"><span /> Your IT partner for what&apos;s next</div>
          <h1>
            Technology that works.<br />
            <em>Business that grows.</em>
          </h1>
          <p>
            RETECH membantu bisnis membangun produk digital, menjaga infrastruktur,
            dan menyelesaikan tantangan IT—dari ide hingga operasional.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Start a project <span>↗</span></a>
            <Link className="button button-secondary" href="/work">View our work <span>↘</span></Link>
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
          <p>Tiga lini layanan yang menghubungkan pembangunan produk, stabilitas operasional, dan dukungan teknis menjadi satu solusi.</p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
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
              <a href="#contact" aria-label={`Discuss ${service.title}`}>
                Discuss this service <span>↗</span>
              </a>
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
            <p>Implementasi website, aplikasi bisnis, HRMS, dan monitoring yang dipilih dari sistem aktif.</p>
            <span className="privacy-note">Client identity protected by confidentiality</span>
          </div>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        </div>
        <Link className="work-link" href="/work">Explore all case studies <span>↗</span></Link>
      </section>

      <section className="approach-section" id="approach">
        <div className="approach-panel">
          <div className="approach-copy">
            <span className="kicker">HOW WE WORK</span>
            <h2>Clear process.<br /><em>Measurable impact.</em></h2>
            <p>Kami mulai dari kebutuhan bisnis, menyusun solusi yang tepat, lalu menjaga hasilnya tetap optimal.</p>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><strong>Discover</strong><p>Memahami tujuan, tantangan, pengguna, dan sistem yang sudah berjalan.</p></div></li>
            <li><span>02</span><div><strong>Design &amp; Deliver</strong><p>Merancang solusi, mengembangkan secara iteratif, dan menguji bagian penting.</p></div></li>
            <li><span>03</span><div><strong>Operate &amp; Improve</strong><p>Memantau, mendukung, dan meningkatkan performa secara berkelanjutan.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-glow" />
        <div className="contact-inner">
          <div className="contact-copy">
            <span className="kicker">LET&apos;S BUILD WHAT&apos;S NEXT</span>
            <h2>Ready to move your<br /><em>business forward?</em></h2>
            <p>Ceritakan kebutuhan IT Anda. Inquiry akan tersimpan dengan aman dan tim RETECH akan menghubungi Anda untuk langkah berikutnya.</p>
            <div className="contact-note"><span>01</span><p>Pilih layanan dan jelaskan kebutuhan Anda.</p></div>
            <div className="contact-note"><span>02</span><p>Tim kami meninjau scope dan menghubungi Anda.</p></div>
            <div className="contact-note"><span>03</span><p>Kami susun solusi serta estimasi yang relevan.</p></div>
            <a className="contact-email" href="mailto:sales@retech.id">sales@retech.id <span>↗</span></a>
          </div>
          <div className="contact-form-card">
            <span className="contact-form-label">PROJECT INQUIRY</span>
            <h3>Ceritakan kebutuhan Anda.</h3>
            <LeadForm source="contact" />
          </div>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
