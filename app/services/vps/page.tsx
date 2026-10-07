import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { companyContact } from "@/lib/company";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import styles from "./vps.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/services/vps");
  const title = en ? "VPS & Cloud Server" : "Layanan VPS & Cloud Server";
  const description = en
    ? "Explore RETECH VPS options for Linux, Windows, performance workloads, and dedicated infrastructure. Control panel licenses are optional; request a tailored quote."
    : "Pilih layanan VPS RETECH untuk Linux, Windows, workload berperforma tinggi, dan infrastruktur dedicated. Lisensi control panel opsional; minta penawaran sesuai kebutuhan.";

  return {
    title,
    description,
    alternates: { canonical, languages: languageAlternates("/services/vps") },
    openGraph: { type: "website", url: canonical, title: `${title} | RETECH`, description, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: `${title} | RETECH`, description, images: ["/og.png"] },
  };
}

export default async function VpsServicePage() {
  const locale = await getLocale();
  const en = locale === "en";
  const pageUrl = absoluteLocaleUrl(locale, "/services/vps");
  const title = en ? "VPS & Cloud Server" : "Layanan VPS & Cloud Server";
  const description = en
    ? "Flexible virtual and dedicated infrastructure for business websites, applications, databases, and Windows workloads."
    : "Infrastruktur virtual dan dedicated yang fleksibel untuk website bisnis, aplikasi, database, dan workload Windows.";
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: title,
    serviceType: en ? "VPS and cloud server services" : "Layanan VPS dan cloud server",
    description,
    url: pageUrl,
    provider: { "@id": "https://retech.id/#organization" },
    areaServed: { "@type": "Country", name: "Indonesia" },
    audience: { "@type": "BusinessAudience", audienceType: en ? "Businesses and organizations" : "Bisnis dan organisasi" },
    inLanguage: localeConfig[locale].schemaLang,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : "Beranda", item: absoluteLocaleUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: en ? "Services" : "Layanan", item: absoluteLocaleUrl(locale, "/services") },
      { "@type": "ListItem", position: 3, name: title, item: pageUrl },
    ],
  };

  const plans = en ? [
    {
      number: "01",
      category: "STANDARD COMPUTE",
      name: "RDS Lite",
      badge: "SSD",
      summary: "A versatile starting point for business websites, internal tools, databases, and general-purpose services.",
      specs: ["1–16 vCPU", "1–16 GB RAM", "60 GB SSD"],
      featured: false,
    },
    {
      number: "02",
      category: "PERFORMANCE COMPUTE",
      name: "RDS PRO",
      badge: "NVMe",
      summary: "For applications and databases that need fast I/O, consistent performance, and room to scale.",
      specs: ["1–12 vCPU", "1–24 GB RAM", "30–100 GB NVMe", "40,000 guaranteed IOPS*"],
      featured: true,
    },
    {
      number: "03",
      category: "WINDOWS WORKLOAD",
      name: "RDS Windows",
      badge: "WINDOWS SERVER",
      summary: "A Windows Server environment for compatible business applications and remote desktop workflows.",
      specs: ["Windows Server 2022 / 2025", "1–12 vCPU", "2–24 GB RAM", "40–100 GB NVMe"],
      featured: false,
    },
    {
      number: "04",
      category: "DEDICATED COMPUTE",
      name: "RDS Dedicated",
      badge: "CUSTOM SCOPE",
      summary: "Dedicated physical infrastructure for workloads with specific capacity, isolation, or performance needs.",
      specs: ["Dedicated hardware", "Intel Xeon / AMD EPYC options", "Configuration by proposal"],
      featured: false,
    },
  ] : [
    {
      number: "01",
      category: "STANDARD COMPUTE",
      name: "RDS Lite",
      badge: "SSD",
      summary: "Pilihan serbaguna untuk website bisnis, tools internal, database, dan layanan umum dengan kebutuhan resource bertahap.",
      specs: ["1–16 vCPU", "1–16 GB RAM", "60 GB SSD"],
      featured: false,
    },
    {
      number: "02",
      category: "PERFORMANCE COMPUTE",
      name: "RDS PRO",
      badge: "NVMe",
      summary: "Untuk aplikasi dan database yang memerlukan I/O cepat, performa konsisten, serta kapasitas untuk berkembang.",
      specs: ["1–12 vCPU", "1–24 GB RAM", "30–100 GB NVMe", "40.000 IOPS terjamin*"],
      featured: true,
    },
    {
      number: "03",
      category: "WINDOWS WORKLOAD",
      name: "RDS Windows",
      badge: "WINDOWS SERVER",
      summary: "Lingkungan Windows Server untuk aplikasi bisnis yang kompatibel dan alur kerja remote desktop.",
      specs: ["Windows Server 2022 / 2025", "1–12 vCPU", "2–24 GB RAM", "40–100 GB NVMe"],
      featured: false,
    },
    {
      number: "04",
      category: "DEDICATED COMPUTE",
      name: "RDS Dedicated",
      badge: "CUSTOM SCOPE",
      summary: "Infrastruktur server fisik dedicated untuk workload dengan kebutuhan kapasitas, isolasi, atau performa khusus.",
      specs: ["Hardware dedicated", "Pilihan Intel Xeon / AMD EPYC", "Konfigurasi melalui penawaran"],
      featured: false,
    },
  ];

  const faqs = en ? [
    ["Are VPS prices published on this page?", "No. RETECH prepares a quotation based on resource sizing, operating system, optional licenses, and the requested support scope."],
    ["Is a control panel included?", "A control panel is optional. Choose Plesk, cPanel, or no control panel; license edition and fees, if selected, are listed in the quotation."],
    ["What SLA and technical support apply?", "The infrastructure provider's published SLA is 99.9% monthly uptime for covered infrastructure, excluding scheduled maintenance; implementation and managed-support services are outside that infrastructure commitment, and dedicated/bare-metal has a separate SLA. For a qualifying breach, service credit may be available up to 30% of the monthly usage fee, subject to exclusions and a claim within three months. RDS Lite lists 24/7 support with a response under three minutes—not a resolution guarantee. The quotation confirms the applicable package terms."],
    ["Does VPS include backup or snapshots?", "VM snapshots are an optional add-on that can save a VM state for restoration. Snapshot creation is not automatic. Additional disk is also an optional storage add-on, not automatic backup. Scheduled or off-site backup scope, retention, and cost should be confirmed in the quotation."],
    ["Can RETECH manage the server?", "Yes. Server installation, configuration, migration, troubleshooting, and hardening can be scoped separately as Manage Server work."],
  ] : [
    ["Apakah harga VPS ditampilkan di halaman ini?", "Tidak. RETECH menyusun penawaran berdasarkan resource, sistem operasi, lisensi opsional, dan dukungan yang dibutuhkan."],
    ["Apakah control panel sudah termasuk?", "Control panel bersifat opsional. Pilih Plesk, cPanel, atau VPS tanpa panel; edisi dan biaya lisensi (jika dipilih) dicantumkan pada quotation."],
    ["SLA dan dukungan teknis apa yang berlaku?", "SLA infrastruktur dari penyedia paket menetapkan uptime 99,9% per bulan untuk infrastruktur yang tercakup, di luar pemeliharaan terjadwal; pekerjaan implementasi dan managed support tidak termasuk dalam komitmen infrastruktur tersebut, sedangkan layanan dedicated/bare-metal memiliki SLA terpisah. Jika memenuhi syarat, kredit layanan dapat diajukan maksimal 30% biaya penggunaan bulanan, tunduk pada pengecualian dan pengajuan paling lambat tiga bulan setelah gangguan. Informasi RDS Lite mencantumkan dukungan 24/7 dengan respons di bawah tiga menit—bukan jaminan penyelesaian. Ketentuan paket yang berlaku dicantumkan dalam quotation."],
    ["Apakah VPS sudah termasuk backup atau snapshot?", "Snapshot VM tersedia sebagai add-on opsional untuk menyimpan kondisi VM dan membantu restore. Pembuatan snapshot tidak otomatis. Additional disk juga add-on penyimpanan, bukan backup otomatis. Ruang lingkup backup terjadwal atau off-site, retensi, dan biayanya perlu dikonfirmasi pada quotation."],
    ["Apakah RETECH bisa membantu mengelola server?", "Bisa. Instalasi, konfigurasi, migrasi, troubleshooting, dan hardening server dapat ditawarkan terpisah sebagai pekerjaan Manage Server."],
  ];

  const whatsappMessage = en
    ? "Hello RETECH, I would like a VPS quotation. Please help me choose a suitable configuration."
    : "Halo RETECH, saya ingin meminta penawaran VPS. Mohon bantu rekomendasikan konfigurasi yang sesuai.";
  const whatsappHref = `https://wa.me/${companyContact.whatsappE164.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailHref = `mailto:${companyContact.email}?subject=${encodeURIComponent(en ? "RETECH VPS Quote Request" : "Permintaan Penawaran VPS RETECH")}`;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />

      <article className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <Link className="back-link" href={localePath(locale, "/services")}>← {en ? "All services" : "Semua layanan"}</Link>
            <span className="kicker">RETECH INFRASTRUCTURE / VPS</span>
            <h1>{en ? <>VPS that fits.<br /><em>Ready to grow.</em></> : <>VPS yang pas.<br /><em>Siap berkembang.</em></>}</h1>
            <p>{en
              ? "Choose VPS infrastructure by resource needs, operating system, and performance profile. RETECH does not publish resale pricing here; request a tailored quotation."
              : "Pilih layanan VPS berdasarkan kebutuhan resource, sistem operasi, dan karakter workload. Harga RETECH tidak ditampilkan di sini—minta penawaran sesuai konfigurasi yang Anda perlukan."}</p>
            <div className={styles.heroActions}>
              <a className="button button-primary" href={emailHref} data-analytics="contact_cta_click" data-analytics-source="vps_hero">{en ? "Request a quotation" : "Minta penawaran"}<span>↗</span></a>
              <a className="button button-secondary" href="#packages">{en ? "Explore VPS options" : "Lihat pilihan VPS"}<span>↓</span></a>
            </div>
            <div className={styles.heroNote}>{en ? "LINUX & WINDOWS · OPTIONAL PANEL · QUOTATION-BASED" : "LINUX & WINDOWS · PANEL OPSIONAL · BERDASARKAN PENAWARAN"}</div>
          </div>
          <aside className={styles.heroPanel} aria-label={en ? "VPS service highlights" : "Ringkasan layanan VPS"}>
            <div className={styles.panelHeader}><span className={styles.panelMark}>R</span><div><strong>RETECH INFRASTRUCTURE</strong><small>{en ? "VPS configuration overview" : "Ringkasan konfigurasi VPS"}</small></div><span className={styles.panelPulse} /></div>
            <div className={styles.panelBody}>
              <span className={styles.panelEyebrow}>{en ? "CONFIGURE AROUND YOUR WORKLOAD" : "SESUAIKAN DENGAN WORKLOAD"}</span>
              <div className={styles.panelMetric}><span>COMPUTE</span><strong>vCPU <i>↗</i></strong><small>{en ? "Scale by plan" : "Pilih sesuai paket"}</small></div>
              <div className={styles.panelMetric}><span>MEMORY</span><strong>RAM <i>↗</i></strong><small>{en ? "Sized for your application" : "Disesuaikan dengan aplikasi"}</small></div>
              <div className={styles.panelMetric}><span>STORAGE</span><strong>SSD / NVMe <i>↗</i></strong><small>{en ? "Optional disk and snapshots" : "Opsi disk & snapshot"}</small></div>
              <div className={styles.panelStatus}><span><i /> {en ? "QUOTE-BASED" : "MINTA PENAWARAN"}</span><small>{en ? "No public resale prices" : "Tanpa harga jual publik"}</small></div>
            </div>
            <div className={styles.panelFooter}><span>01 / FLEXIBLE</span><span>02 / SCALABLE</span><span>03 / OPERATIONS</span></div>
          </aside>
        </header>

        <section className={styles.panelNotice} aria-labelledby="panel-options-heading">
          <span className={styles.panelNoticeIcon} aria-hidden="true">⌘</span>
          <div><span className="kicker">{en ? "CONTROL PANEL OPTIONS" : "PILIHAN CONTROL PANEL"}</span><h2 id="panel-options-heading">{en ? "Choose the panel that works for you." : "Pilih panel yang sesuai."}</h2><p>{en ? "License is optional: Plesk, cPanel, or no control panel. The selected edition and license cost will be stated in your quotation." : "Lisensi bersifat opsional: Plesk, cPanel, atau tanpa control panel. Edisi dan biaya lisensi yang dipilih akan dicantumkan dalam quotation."}</p></div>
          <span className={styles.panelNoticeBadge}>{en ? "OPTIONAL" : "OPSIONAL"}</span>
        </section>

        <section className={styles.packageSection} id="packages" aria-labelledby="packages-heading">
          <div className={styles.sectionHeading}>
            <div><span className="kicker">{en ? "CHOOSE BY WORKLOAD" : "PILIH SESUAI WORKLOAD"}</span><h2 id="packages-heading">{en ? <>One need.<br /><em>Several right-sized options.</em></> : <>Satu kebutuhan.<br /><em>Beberapa opsi yang tepat.</em></>}</h2></div>
            <p>{en ? "These ranges summarize the available configurations. Final specification, availability, operating system, and optional licenses are confirmed in a RETECH quotation." : "Rentang di bawah merangkum pilihan konfigurasi yang tersedia. Spesifikasi akhir, ketersediaan, sistem operasi, dan lisensi opsional dikonfirmasi dalam quotation RETECH."}</p>
          </div>
          <div className={styles.packageGrid}>
            {plans.map((plan) => (
              <article className={`${styles.packageCard} ${plan.featured ? styles.featuredCard : ""}`} key={plan.number}>
                <div className={styles.packageTop}><span>{plan.number} / {plan.category}</span><span className={styles.packageBadge}>{plan.badge}</span></div>
                <h3>{plan.name}</h3>
                <p>{plan.summary}</p>
                <div className={styles.specList}>{plan.specs.map((spec) => <span key={spec}>{spec}</span>)}</div>
                <div className={styles.packageFooter}><span>{en ? "Pricing by quotation" : "Harga melalui penawaran"}</span><a href={emailHref} aria-label={`${en ? "Request quote for" : "Minta penawaran"} ${plan.name}`} data-analytics="contact_cta_click" data-analytics-source={`vps_${plan.name.toLowerCase().replaceAll(" ", "_")}`}>↗</a></div>
              </article>
            ))}
          </div>
          <p className={styles.technicalNote}>{en ? "*The I/O performance figure applies to specific performance-plan configurations, not every VPS option." : "*Angka performa I/O berlaku untuk konfigurasi paket performa tertentu, bukan seluruh opsi VPS."}</p>
        </section>

        <section className={styles.addonSection} aria-labelledby="addons-heading">
          <div className={styles.sectionHeading}>
            <div><span className="kicker">{en ? "MORE THAN COMPUTE" : "LEBIH DARI COMPUTE"}</span><h2 id="addons-heading">{en ? <>Extend the setup.<br /><em>Only where you need it.</em></> : <>Lengkapi konfigurasi.<br /><em>Sesuai kebutuhan.</em></>}</h2></div>
            <p>{en ? "Storage and operations options are scoped separately so your proposal stays clear about what is—and is not—included." : "Opsi storage dan operasional dibahas terpisah agar penawaran menjelaskan dengan terang apa yang termasuk dan yang tidak."}</p>
          </div>
          <div className={styles.addonGrid}>
            <article className={styles.addonCard}><span className="kicker">01 / STORAGE & RECOVERY</span><h3>{en ? "Additional disk & snapshots" : "Additional disk & snapshot"}</h3><p>{en ? "Additional disk and VM snapshots are optional add-ons. A snapshot saves the VM state at a point in time and can help restore it; snapshot creation is not automatic." : "Additional disk dan snapshot VM tersedia sebagai add-on opsional. Snapshot menyimpan kondisi VM pada satu waktu dan dapat membantu restore; snapshot tidak dibuat otomatis."}</p><ul><li>{en ? "Storage expansion is quoted separately" : "Penambahan kapasitas storage ditawarkan terpisah"}</li><li>{en ? "Snapshot billing cycle and retention are confirmed in the proposal" : "Siklus biaya dan retensi snapshot dikonfirmasi di penawaran"}</li><li>{en ? "Scheduled or off-site backup requires a separately defined scope" : "Backup terjadwal atau off-site perlu scope tersendiri"}</li></ul></article>
            <article className={styles.addonCard}><span className="kicker">02 / OPTIONAL OPERATIONS</span><h3>{en ? "Manage Server" : "Manage Server"}</h3><p>{en ? "Ask RETECH to scope installation, configuration, troubleshooting, migration, or hardening as a separate service." : "Minta RETECH menyusun scope instalasi, konfigurasi, troubleshooting, migrasi, atau hardening sebagai layanan terpisah."}</p><ul><li>{en ? "Work scope agreed before execution" : "Ruang lingkup disepakati sebelum pekerjaan"}</li><li>{en ? "Case-based or project-based quotation" : "Penawaran berdasarkan case atau project"}</li><li>{en ? "Access and change process documented" : "Akses dan proses perubahan terdokumentasi"}</li></ul></article>
          </div>
        </section>

        <section className={styles.slaSection} aria-labelledby="sla-heading">
          <div className={styles.slaCard}>
            <div className={styles.slaCopy}><span className="kicker">SERVICE LEVEL & SUPPORT</span><h2 id="sla-heading">{en ? <>Clear terms.<br /><em>Reliable support.</em></> : <>Ketentuan jelas.<br /><em>Dukungan terarah.</em></>}</h2><p>{en ? "The applicable infrastructure SLA targets 99.9% monthly uptime for covered infrastructure, excluding scheduled maintenance. The Lite plan lists 24/7 support and a response under three minutes; response time is not resolution time." : "SLA infrastruktur yang berlaku menargetkan uptime 99,9% per bulan untuk infrastruktur yang tercakup, di luar pemeliharaan terjadwal. Paket Lite mencantumkan dukungan 24/7 dengan respons di bawah tiga menit; waktu respons bukan waktu penyelesaian."}</p></div>
            <div className={styles.slaStats}>
              <div><strong>99,9%</strong><span>{en ? "MONTHLY UPTIME*" : "UPTIME BULANAN*"}</span></div>
              <div><strong>24/7</strong><span>{en ? "TECHNICAL SUPPORT**" : "DUKUNGAN TEKNIS**"}</span></div>
              <div><strong>&lt;3 min</strong><span>{en ? "LITE RESPONSE**" : "RESPONS LITE**"}</span></div>
            </div>
          </div>
          <p className={styles.slaFootnote}>{en
            ? "*Infrastructure SLA covers eligible infrastructure only; scheduled maintenance and exclusions apply. Implementation/managed support is not included, and dedicated/bare-metal has a separate SLA. Qualifying service credit may be capped at 30% of monthly usage fees and claimed within three months, subject to terms. **The 24/7 and under-three-minute response information is published for Lite; coverage varies by configuration and response is not resolution. Quotation confirms applicable terms."
            : "*SLA hanya mencakup infrastruktur yang memenuhi ketentuan; pemeliharaan terjadwal dan pengecualian berlaku. Implementasi/managed support tidak termasuk, dan dedicated/bare-metal memiliki SLA terpisah. Kredit layanan yang memenuhi syarat dapat dibatasi maksimal 30% biaya bulanan dan harus diajukan dalam tiga bulan, sesuai ketentuan. **Informasi dukungan 24/7 dan respons di bawah tiga menit dipublikasikan untuk Lite; cakupan bergantung konfigurasi dan respons bukan penyelesaian. Quotation memastikan ketentuan yang berlaku."}</p>
        </section>

        <section className={styles.faqSection} aria-labelledby="faq-heading">
          <div className={styles.sectionHeading}><div><span className="kicker">FAQ</span><h2 id="faq-heading">{en ? <>Before you<br /><em>choose a plan.</em></> : <>Sebelum Anda<br /><em>memilih paket.</em></>}</h2></div></div>
          <div className={styles.faqList}>{faqs.map(([question, answer], index) => <details className={styles.faqItem} key={question}><summary><span>0{index + 1}</span><strong>{question}</strong><i aria-hidden="true">+</i></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className={styles.finalCta}>
          <span className="kicker">{en ? "NEXT STEP" : "LANGKAH SELANJUTNYA"}</span>
          <h2>{en ? <>Tell us what your<br /><em>server needs to do.</em></> : <>Ceritakan apa yang<br /><em>perlu dijalankan server.</em></>}</h2>
          <p>{en ? "Share your operating system, workload, current setup, and resource estimate. RETECH will help shape a suitable configuration and quotation." : "Sampaikan sistem operasi, workload, konfigurasi saat ini, dan perkiraan resource. RETECH akan membantu menyusun konfigurasi dan penawaran yang sesuai."}</p>
          <div className={styles.finalActions}>
            <a className="button button-primary" href={emailHref} data-analytics="contact_cta_click" data-analytics-source="vps_bottom">{en ? "Request a quotation" : "Minta quotation"}<span>↗</span></a>
            <a className="button button-secondary" href={whatsappHref} target="_blank" rel="noreferrer" data-analytics="whatsapp_click" data-analytics-source="vps_bottom">WhatsApp · {en ? "Chat only" : "Chat only"}<span>↗</span></a>
          </div>
        </section>
      </article>

      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
