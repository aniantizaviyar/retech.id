import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/pricing");
  const description = en ? "Starting estimates for RETECH development, managed IT, remote support, domains, hosting, and server services." : "Estimasi awal layanan development, managed IT, remote support, domain, hosting, dan server RETECH.";
  return { title: "Pricing", description, alternates: { canonical, languages: languageAlternates("/pricing") }, openGraph: { type: "website", url: canonical, title: "RETECH IT Services Pricing", description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "RETECH services pricing" }] }, twitter: { card: "summary_large_image", title: "RETECH IT Services Pricing", description, images: ["/og.png"] } };
}

const packages = [
  { eyebrow: "LANDING PAGE", name: "Landing Page", price: "Rp2,5 juta", description: "Satu halaman yang fokus menghasilkan inquiry untuk promosi produk, jasa, personal brand, atau campaign digital.", features: ["Hingga 8 section", "Custom UI sesuai brand", "Modern frontend dengan Next.js/React", "Responsive & mobile-friendly", "Form inquiry dan WhatsApp CTA", "Basic SEO, deployment, dan SSL", "2x revisi dan garansi bug 30 hari"] },
  { eyebrow: "DIGITAL PRESENCE", name: "Company Profile", price: "Rp4,5 juta", description: "Untuk bisnis yang membutuhkan website profesional, cepat, dan mudah ditemukan.", features: ["Hingga 7 halaman", "Modern frontend dengan Next.js/React", "Responsive & mobile-friendly", "Form kontak dan basic SEO", "Deployment dan SSL", "Garansi bug 30 hari"] },
  { eyebrow: "BUSINESS SYSTEM", name: "Website + CMS", price: "Rp10 juta", description: "Website dengan area pengelolaan konten atau dashboard sesuai alur kerja bisnis.", features: ["UI sesuai brand", "CMS atau dashboard admin", "Next.js/React atau Laravel sesuai kebutuhan", "Database dan user management", "Integrasi email", "Garansi bug 60 hari"], recommended: true },
  { eyebrow: "CUSTOM WEB SYSTEM", name: "Web App", price: "Rp20 juta", description: "Aplikasi berbasis browser untuk menjalankan proses bisnis, workflow, dan pengolahan data custom.", features: ["Discovery dan pemetaan workflow", "Next.js/React dan Laravel/API sesuai kebutuhan", "Frontend, backend, database, dan API", "Role dan hak akses", "Dashboard dan reporting dasar", "Testing, deployment, dan handover", "Garansi bug 60 hari"] },
  { eyebrow: "ANDROID APPLICATION", name: "Android App", price: "Rp25 juta", description: "Aplikasi Android custom untuk kebutuhan operasional, layanan customer, atau digitalisasi proses lapangan.", features: ["Flutter atau teknologi native sesuai kebutuhan", "UI Android dan fitur inti", "Backend dan API dasar", "Testing dan file APK/AAB", "Bantuan submission Google Play", "Akun dan biaya Play Store tidak termasuk", "Garansi bug 60 hari"] },
  { eyebrow: "MULTI-PLATFORM APP", name: "Android + iOS", price: "Rp50 juta", description: "Satu solusi mobile untuk Android dan iOS dengan backend serta alur pengguna yang terintegrasi.", features: ["Cross-platform modern menggunakan Flutter", "Aplikasi Android dan iOS", "Backend, database, dan API dasar", "Testing dan production build", "Bantuan submission kedua store", "Akun dan biaya store tidak termasuk", "Garansi bug 90 hari"] },
];

const hosting = [
  { name: "Domain & Hosting Basic", price: "Rp1 juta / tahun", description: "Untuk landing page atau company profile statis dengan kebutuhan trafik normal.", features: ["Domain .com maksimal Rp250 ribu", "Hosting website statis", "DNS dan konfigurasi SSL", "Deployment awal", "Monitoring uptime dasar"] },
  { name: "Managed Cloud Hosting", price: "Rp3 juta / tahun", description: "Untuk website CMS atau aplikasi kecil yang membutuhkan runtime, database, dan pengelolaan server.", features: ["Cloud server sesuai kebutuhan awal", "DNS dan SSL", "Backup mingguan", "Patch dan monitoring dasar", "Review kapasitas berkala"] },
];

const support = [
  ["Server Care Basic", "Mulai Rp500 ribu / server / bulan", "Monitoring, pemeriksaan resource, SSL, dan patch terjadwal."],
  ["Server Care Pro", "Mulai Rp1,5 juta / server / bulan", "Monitoring lebih lengkap, backup check, dan bantuan insiden prioritas."],
  ["Remote Support", "Mulai Rp250 ribu / sesi", "Troubleshooting satu kendala melalui koneksi remote."],
  ["Server Installation", "Mulai Rp1,5 juta", "Instalasi dan konfigurasi Linux server berdasarkan kebutuhan."],
];

const englishPackages = [
  { eyebrow: "LANDING PAGE", name: "Landing Page", price: "IDR 2.5 million", description: "A focused single-page website designed to generate inquiries for products, services, personal brands, or digital campaigns.", features: ["Up to 8 sections", "Custom UI aligned with your brand", "Modern frontend with Next.js/React", "Responsive and mobile-friendly", "Inquiry form and WhatsApp CTA", "Basic SEO, deployment, and SSL", "2 revision rounds and 30-day bug warranty"] },
  { eyebrow: "DIGITAL PRESENCE", name: "Company Profile", price: "IDR 4.5 million", description: "For businesses that need a professional, fast, and discoverable website.", features: ["Up to 7 pages", "Modern frontend with Next.js/React", "Responsive and mobile-friendly", "Contact form and basic SEO", "Deployment and SSL", "30-day bug warranty"] },
  { eyebrow: "BUSINESS SYSTEM", name: "Website + CMS", price: "IDR 10 million", description: "A website with content management or an admin dashboard tailored to the business workflow.", features: ["UI aligned with your brand", "CMS or admin dashboard", "Next.js/React or Laravel as required", "Database and user management", "Email integration", "60-day bug warranty"], recommended: true },
  { eyebrow: "CUSTOM WEB SYSTEM", name: "Web App", price: "IDR 20 million", description: "A browser-based application for custom business processes, workflows, and data processing.", features: ["Discovery and workflow mapping", "Next.js/React and Laravel/API as required", "Frontend, backend, database, and APIs", "Roles and access control", "Basic dashboard and reporting", "Testing, deployment, and handover", "60-day bug warranty"] },
  { eyebrow: "ANDROID APPLICATION", name: "Android App", price: "IDR 25 million", description: "A custom Android application for operations, customer services, or digital field processes.", features: ["Flutter or native technology as required", "Android UI and core features", "Basic backend and API", "Testing and APK/AAB files", "Google Play submission assistance", "Play Store account and fees excluded", "60-day bug warranty"] },
  { eyebrow: "MULTI-PLATFORM APP", name: "Android + iOS", price: "IDR 50 million", description: "One mobile solution for Android and iOS with an integrated backend and user journey.", features: ["Modern cross-platform development with Flutter", "Android and iOS applications", "Basic backend, database, and API", "Testing and production builds", "Submission assistance for both stores", "Store accounts and fees excluded", "90-day bug warranty"] },
];

const englishHosting = [
  { name: "Domain & Hosting Basic", price: "IDR 1 million / year", description: "For a static landing page or company profile with normal traffic requirements.", features: [".com domain up to IDR 250 thousand", "Static website hosting", "DNS and SSL configuration", "Initial deployment", "Basic uptime monitoring"] },
  { name: "Managed Cloud Hosting", price: "IDR 3 million / year", description: "For a CMS website or small application that needs a runtime, database, and server management.", features: ["Cloud server sized for initial requirements", "DNS and SSL", "Weekly backups", "Basic patching and monitoring", "Periodic capacity review"] },
];

const englishSupport = [
  ["Server Care Basic", "From IDR 500 thousand / server / month", "Monitoring, resource checks, SSL checks, and scheduled patching."],
  ["Server Care Pro", "From IDR 1.5 million / server / month", "More complete monitoring, backup checks, and priority incident support."],
  ["Remote Support", "From IDR 250 thousand / session", "Troubleshooting for one issue through a remote connection."],
  ["Server Installation", "From IDR 1.5 million", "Linux server installation and configuration based on requirements."],
];

export default async function PricingPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const localizedPackages = en ? englishPackages : packages;
  const localizedHosting = en ? englishHosting : hosting;
  const localizedSupport = en ? englishSupport : support;
  return (
    <main>
      <SiteHeader locale={locale} />
      <section className="pricing-hero">
        <span className="kicker">PRICING GUIDE</span>
        <h1>Clear starting point.<br /><em>Flexible final scope.</em></h1>
        <div className="pricing-intro"><p>{en ? "The following prices are starting estimates to support planning. A final proposal is prepared after requirements, complexity, and timeline are understood." : "Harga berikut adalah estimasi awal untuk membantu perencanaan. Penawaran final dibuat setelah kebutuhan, kompleksitas, dan timeline dipahami."}</p><span>{en ? "Starting prices • Not fixed rates" : "Harga mulai dari • Bukan tarif tetap"}</span></div>
      </section>
      <section className="pricing-section">
        <div className="pricing-heading"><div><span className="kicker">01 / DEVELOPMENT</span><h2>Build what your<br /><em>business needs.</em></h2></div><p>{en ? "From professional websites to business systems and custom mobile applications." : "Mulai dari website profesional hingga sistem bisnis dan aplikasi mobile custom."}</p></div>
        <div className="pricing-grid">
          {localizedPackages.map((item) => <article className={`pricing-card${item.recommended ? " pricing-card-featured" : ""}`} key={item.name}>
            {item.recommended && <span className="pricing-badge">RECOMMENDED</span>}<span className="pricing-eyebrow">{item.eyebrow}</span><h3>{item.name}</h3><p>{item.description}</p>
            <div className="pricing-price"><small>{en ? "Starting from" : "Mulai dari"}</small><strong>{item.price}</strong></div><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source={`pricing_${item.name}`}>{en ? "Discuss your needs" : "Diskusikan kebutuhan"} <span>↗</span></Link>
          </article>)}
        </div>
      </section>
      <section className="pricing-comparison">
        <div className="pricing-heading"><div><span className="kicker">02 / MODERN TECHNOLOGY</span><h2>Modern stack.<br /><em>Chosen with purpose.</em></h2></div><p>{en ? "Pricing covers more than the interface. Each project includes architecture selection, implementation, testing, and handover using technology suited to the business need." : "Harga bukan hanya untuk tampilan. Setiap project mencakup pemilihan arsitektur, implementasi, pengujian, dan handover menggunakan teknologi yang sesuai dengan kebutuhan bisnis."}</p></div>
        <div className="comparison-grid">
          <article><span>WEB & BUSINESS SYSTEM</span><h3>Next.js, React & Laravel</h3><p>{en ? "A modern frontend for fast, responsive experiences, combined with a backend, APIs, and database tailored to the workflow." : "Frontend modern untuk pengalaman yang cepat dan responsif, dipadukan dengan backend, API, dan database yang disesuaikan dengan workflow."}</p><ul><li>Next.js, React, {en ? "and" : "dan"} TypeScript</li><li>Laravel/PHP {en ? "and" : "dan"} REST API</li><li>SQL database {en ? "and role management" : "dan role management"}</li><li>SEO, security, {en ? "and maintainability" : "dan maintainability"}</li></ul></article>
          <article><span>MOBILE APPLICATION</span><h3>Flutter for Android & iOS</h3><p>{en ? "Cross-platform mobile development with one product foundation while respecting the experience and requirements of each device." : "Pengembangan aplikasi mobile lintas platform dengan satu fondasi produk, tanpa mengabaikan pengalaman dan kebutuhan masing-masing perangkat."}</p><ul><li>Flutter {en ? "for" : "untuk"} Android {en ? "and" : "dan"} iOS</li><li>Backend {en ? "and API integration" : "dan integrasi API"}</li><li>{en ? "Testing and production builds" : "Testing serta production build"}</li><li>{en ? "Store submission assistance" : "Bantuan proses submission store"}</li></ul></article>
        </div>
      </section>
      <section className="pricing-comparison">
        <div className="pricing-heading"><div><span className="kicker">03 / CHOOSE THE RIGHT BUILD</span><h2>CMS manages content.<br /><em>Web apps run processes.</em></h2></div><p>{en ? "Both may use a database and login, but their purpose, logic, and development complexity are different." : "Keduanya memakai database dan login, tetapi tujuan, logika, serta kompleksitas pengembangannya berbeda."}</p></div>
        <div className="comparison-grid">
          <article><span>WEBSITE + CMS</span><h3>{en ? "Publish and manage content" : "Publikasi dan kelola konten"}</h3><p>{en ? "Suitable for company profiles, news, catalogs, service pages, careers, and content updated by administrators." : "Cocok untuk company profile, berita, katalog, halaman layanan, career, dan konten yang diperbarui admin."}</p><ul><li>{en ? "Focused on public pages" : "Fokus pada halaman publik"}</li><li>{en ? "Administrators manage content" : "Admin mengelola konten"}</li><li>{en ? "Relatively simple workflow" : "Workflow relatif sederhana"}</li><li>{en ? "Example: company website + news CMS" : "Contoh: website perusahaan + news CMS"}</li></ul></article>
          <article><span>WEB APPLICATION</span><h3>{en ? "Run business processes" : "Jalankan proses bisnis"}</h3><p>{en ? "Suitable for operational systems with multiple users, roles, statuses, calculations, approvals, integrations, and reporting." : "Cocok untuk sistem operasional dengan banyak user, role, status, perhitungan, approval, integrasi, dan reporting."}</p><ul><li>{en ? "Focused on user activity" : "Fokus pada aktivitas pengguna"}</li><li>{en ? "More complex business logic" : "Business logic lebih kompleks"}</li><li>{en ? "More detailed access control and audit" : "Hak akses dan audit lebih detail"}</li><li>{en ? "Examples: HRMS, logistics tracking, mini ERP" : "Contoh: HRMS, logistics tracking, ERP mini"}</li></ul></article>
        </div>
      </section>
      <section className="support-pricing">
        <div className="pricing-heading"><div><span className="kicker">04 / SUPPORT & OPERATIONS</span><h2>Keep systems<br /><em>running reliably.</em></h2></div><p>{en ? "Choose one-time assistance or recurring management based on capacity and system risk." : "Pilih bantuan insidental atau pengelolaan rutin sesuai kapasitas dan tingkat risiko sistem."}</p></div>
        <div className="support-price-list">{localizedSupport.map(([name, price, description], index) => <article key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{description}</p></div><strong>{price}</strong></article>)}</div>
      </section>
      <section className="hosting-pricing">
        <div className="pricing-heading"><div><span className="kicker">05 / DOMAIN & HOSTING</span><h2>Infrastructure,<br /><em>without hidden ownership.</em></h2></div><p>{en ? "Domains and cloud services are recurring costs. Accounts and ownership remain under the customer's name; RETECH assists with setup and management." : "Domain dan cloud adalah biaya berulang. Akun dan kepemilikan tetap atas nama customer; RETECH membantu setup dan pengelolaannya."}</p></div>
        <div className="hosting-grid">{localizedHosting.map((item) => <article key={item.name}><span>OPTIONAL ADD-ON</span><h3>{item.name}</h3><strong>{item.price}</strong><p>{item.description}</p><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}</div>
        <p className="hosting-disclaimer">{en ? "Renewal pricing follows registrar and cloud-provider rates. High resource usage, large storage, email hosting, licenses, and third-party services are quoted separately." : "Harga perpanjangan mengikuti tarif registrar dan cloud provider. Pemakaian resource tinggi, storage besar, email hosting, lisensi, dan layanan pihak ketiga dihitung terpisah."}</p>
      </section>
      <section className="pricing-notes">
        <div><span className="kicker">GOOD TO KNOW</span><h2>Scope before<br /><em>commitment.</em></h2></div>
        <div className="pricing-note-grid">{(en ? [
          ["Included", "Short discovery, work estimate, testing, and handover according to the agreed scope."],
          ["Not included", "Hosting, domains, developer accounts, store fees, licenses, third-party services, taxes, and out-of-scope work."],
          ["Store publishing", "RETECH helps prepare builds and submissions. The customer provides Google Play or Apple Developer accounts and completes verification."],
          ["Maintenance", "A bug warranty is different from new features. Ongoing maintenance is offered as a separate package."],
          ["Ownership", "Domains, cloud services, and store accounts are registered under the customer—not a personal RETECH account."],
          ["Availability", "Schedule and response times are confirmed before work begins. 24/7 service is not included."],
        ] : [
          ["Termasuk", "Discovery singkat, estimasi pekerjaan, testing, dan handover sesuai ruang lingkup."],
          ["Belum termasuk", "Hosting, domain, akun developer, biaya store, lisensi, layanan pihak ketiga, pajak, dan pekerjaan di luar scope."],
          ["Store publishing", "RETECH membantu menyiapkan build dan submission. Customer menyediakan akun Google Play atau Apple Developer dan menyelesaikan verifikasi."],
          ["Maintenance", "Garansi bug berbeda dari fitur baru. Maintenance lanjutan dibuat sebagai paket terpisah."],
          ["Kepemilikan", "Domain, cloud, dan akun store didaftarkan atas nama customer, bukan akun pribadi RETECH."],
          ["Ketersediaan", "Jadwal dan response time dikonfirmasi sebelum pekerjaan dimulai. Layanan 24/7 tidak termasuk."],
        ]).map(([title, copy]) => <p key={title}><strong>{title}</strong>{copy}</p>)}</div>
      </section>
      <section className="pricing-cta"><span className="kicker">GET A REAL ESTIMATE</span><h2>{en ? "Tell us what you need." : "Ceritakan kebutuhan."}<br /><em>{en ? "We'll help map it." : "Kami bantu petakan."}</em></h2><p>{en ? "An initial consultation helps determine the most practical approach, priorities, budget, and timeline." : "Konsultasi awal membantu menentukan pendekatan, prioritas, biaya, dan timeline yang paling masuk akal."}</p><Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="pricing_bottom">{en ? "Request quotation" : "Minta quotation"} <span>↗</span></Link></section>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
