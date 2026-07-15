import type { Metadata } from "next";
import { ChatWidget } from "./ChatWidget";

export const metadata: Metadata = {
  title: "RETECH — IT Solutions That Move Business Forward",
  description:
    "PT. Retech Digital Solution menyediakan website & mobile application development, managed IT services, remote support, dan instalasi server.",
};

const services = [
  {
    number: "01",
    eyebrow: "BUILD",
    title: "Website & Mobile Application",
    description:
      "Produk digital yang cepat, aman, dan dibangun untuk bertumbuh bersama bisnis Anda.",
    items: ["Website", "Company Profile", "CMS", "Android", "iOS", "Web App"],
  },
  {
    number: "02",
    eyebrow: "MANAGE",
    title: "Managed IT Services",
    description:
      "Operasional IT yang terjaga agar tim Anda dapat fokus pada bisnis, bukan gangguan teknis.",
    items: ["Maintenance Server", "Monitoring", "Helpdesk", "Backup"],
  },
  {
    number: "03",
    eyebrow: "SUPPORT",
    title: "Remote Support",
    description:
      "Dukungan teknis responsif dan instalasi server yang dikonfigurasi sesuai kebutuhan.",
    items: ["Remote Troubleshooting", "Server Installation", "Server Configuration"],
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="RETECH home">
          <img src="/retech-logo-transparent.png" alt="RETECH Digital Solution" />
        </a>
        <nav aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="nav-cta" href="mailto:sales@retech.id?subject=Konsultasi%20IT%20RETECH">
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </a>
      </header>

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
            <a className="button button-secondary" href="#services">Explore services <span>↓</span></a>
          </div>
          <div className="trust-row">
            <span>WEB &amp; MOBILE</span><i />
            <span>MANAGED IT</span><i />
            <span>REMOTE SUPPORT</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-core">
            <img src="/retech-logo-transparent.png" alt="" />
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
          <p>Solusi menyeluruh yang dirancang untuk membuat teknologi lebih sederhana, stabil, dan bernilai bagi bisnis.</p>
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
              <div className="service-tags">
                {service.items.map((item) => <span key={item}>{item}</span>)}
              </div>
              <a href="mailto:sales@retech.id?subject=Konsultasi%20Layanan%20RETECH" aria-label={`Discuss ${service.title}`}>
                Discuss this service <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="approach-section" id="approach">
        <div className="approach-panel">
          <div className="approach-copy">
            <span className="kicker">HOW WE WORK</span>
            <h2>Clear process.<br /><em>Measurable impact.</em></h2>
            <p>Kami mulai dari kebutuhan bisnis, menyusun solusi yang tepat, lalu menjaga hasilnya tetap optimal.</p>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><strong>Discover</strong><p>Memahami tujuan, tantangan, dan sistem yang sudah berjalan.</p></div></li>
            <li><span>02</span><div><strong>Design &amp; Deliver</strong><p>Merancang solusi yang relevan dan mengeksekusinya secara terukur.</p></div></li>
            <li><span>03</span><div><strong>Operate &amp; Improve</strong><p>Memantau, mendukung, dan meningkatkan performa secara berkelanjutan.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-glow" />
        <span className="kicker">LET&apos;S BUILD WHAT&apos;S NEXT</span>
        <h2>Ready to move your<br /><em>business forward?</em></h2>
        <p>Ceritakan kebutuhan IT Anda. Tim RETECH siap membantu menemukan langkah terbaik berikutnya.</p>
        <a className="button button-primary" href="mailto:sales@retech.id?subject=Konsultasi%20IT%20RETECH&body=Halo%20RETECH%2C%0A%0ASaya%20ingin%20berkonsultasi%20tentang...">
          sales@retech.id <span>↗</span>
        </a>
      </section>

      <footer>
        <img src="/retech-logo-transparent.png" alt="RETECH Digital Solution" />
        <p>PT. Retech Digital Solution<br />IT solutions that move business forward.</p>
        <div><a href="#services">Services</a><a href="#approach">Approach</a><a href="mailto:sales@retech.id">Email</a></div>
        <small>© {new Date().getFullYear()} RETECH. All rights reserved.</small>
      </footer>

      <ChatWidget />
    </main>
  );
}
