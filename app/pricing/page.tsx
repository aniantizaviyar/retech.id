import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Estimasi awal layanan development, managed IT, dan remote support RETECH.",
};

const packages = [
  { eyebrow: "LANDING PAGE", name: "Landing Page", price: "Rp2,5 juta", description: "Satu halaman yang fokus menghasilkan inquiry untuk promosi produk, jasa, personal brand, atau campaign digital.", features: ["Hingga 8 section", "Custom UI sesuai brand", "Responsive & mobile-friendly", "Form inquiry dan WhatsApp CTA", "Basic SEO, deployment, dan SSL", "2x revisi dan garansi bug 30 hari"] },
  { eyebrow: "DIGITAL PRESENCE", name: "Company Profile", price: "Rp4,5 juta", description: "Untuk bisnis yang membutuhkan website profesional, cepat, dan mudah ditemukan.", features: ["Hingga 7 halaman", "Responsive & mobile-friendly", "Form kontak dan basic SEO", "Deployment dan SSL", "Garansi bug 30 hari"] },
  { eyebrow: "BUSINESS SYSTEM", name: "Website + CMS", price: "Rp10 juta", description: "Website dengan area pengelolaan konten atau dashboard sesuai alur kerja bisnis.", features: ["UI sesuai brand", "CMS atau dashboard admin", "Database dan user management", "Integrasi email", "Garansi bug 60 hari"], recommended: true },
  { eyebrow: "CUSTOM WEB SYSTEM", name: "Web App", price: "Rp20 juta", description: "Aplikasi berbasis browser untuk menjalankan proses bisnis, workflow, dan pengolahan data custom.", features: ["Discovery dan pemetaan workflow", "Frontend, backend, database, dan API", "Role dan hak akses", "Dashboard dan reporting dasar", "Testing, deployment, dan handover", "Garansi bug 60 hari"] },
  { eyebrow: "ANDROID APPLICATION", name: "Android App", price: "Rp25 juta", description: "Aplikasi Android custom untuk kebutuhan operasional, layanan customer, atau digitalisasi proses lapangan.", features: ["UI Android dan fitur inti", "Backend dan API dasar", "Testing dan file APK/AAB", "Bantuan submission Google Play", "Akun dan biaya Play Store tidak termasuk", "Garansi bug 60 hari"] },
  { eyebrow: "MULTI-PLATFORM APP", name: "Android + iOS", price: "Rp50 juta", description: "Satu solusi mobile untuk Android dan iOS dengan backend serta alur pengguna yang terintegrasi.", features: ["Aplikasi Android dan iOS", "Backend, database, dan API dasar", "Testing dan production build", "Bantuan submission kedua store", "Akun dan biaya store tidak termasuk", "Garansi bug 90 hari"] },
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

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />
      <section className="pricing-hero">
        <span className="kicker">PRICING GUIDE</span>
        <h1>Clear starting point.<br /><em>Flexible final scope.</em></h1>
        <div className="pricing-intro"><p>Harga berikut adalah estimasi awal untuk membantu perencanaan. Penawaran final dibuat setelah kebutuhan, kompleksitas, dan timeline dipahami.</p><span>Harga mulai dari • Bukan tarif tetap</span></div>
      </section>
      <section className="pricing-section">
        <div className="pricing-heading"><div><span className="kicker">01 / DEVELOPMENT</span><h2>Build what your<br /><em>business needs.</em></h2></div><p>Mulai dari website profesional hingga sistem bisnis dan aplikasi mobile custom.</p></div>
        <div className="pricing-grid">
          {packages.map((item) => <article className={`pricing-card${item.recommended ? " pricing-card-featured" : ""}`} key={item.name}>
            {item.recommended && <span className="pricing-badge">RECOMMENDED</span>}<span className="pricing-eyebrow">{item.eyebrow}</span><h3>{item.name}</h3><p>{item.description}</p>
            <div className="pricing-price"><small>Mulai dari</small><strong>{item.price}</strong></div><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href="/#contact">Diskusikan kebutuhan <span>↗</span></Link>
          </article>)}
        </div>
      </section>
      <section className="pricing-comparison">
        <div className="pricing-heading"><div><span className="kicker">02 / CHOOSE THE RIGHT BUILD</span><h2>CMS manages content.<br /><em>Web apps run processes.</em></h2></div><p>Keduanya memakai database dan login, tetapi tujuan, logika, serta kompleksitas pengembangannya berbeda.</p></div>
        <div className="comparison-grid">
          <article><span>WEBSITE + CMS</span><h3>Publikasi dan kelola konten</h3><p>Cocok untuk company profile, berita, katalog, halaman layanan, career, dan konten yang diperbarui admin.</p><ul><li>Fokus pada halaman publik</li><li>Admin mengelola konten</li><li>Workflow relatif sederhana</li><li>Contoh: website perusahaan + news CMS</li></ul></article>
          <article><span>WEB APPLICATION</span><h3>Jalankan proses bisnis</h3><p>Cocok untuk sistem operasional dengan banyak user, role, status, perhitungan, approval, integrasi, dan reporting.</p><ul><li>Fokus pada aktivitas pengguna</li><li>Business logic lebih kompleks</li><li>Hak akses dan audit lebih detail</li><li>Contoh: HRMS, logistics tracking, ERP mini</li></ul></article>
        </div>
      </section>
      <section className="support-pricing">
        <div className="pricing-heading"><div><span className="kicker">03 / SUPPORT & OPERATIONS</span><h2>Keep systems<br /><em>running reliably.</em></h2></div><p>Pilih bantuan insidental atau pengelolaan rutin sesuai kapasitas dan tingkat risiko sistem.</p></div>
        <div className="support-price-list">{support.map(([name, price, description], index) => <article key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{description}</p></div><strong>{price}</strong></article>)}</div>
      </section>
      <section className="hosting-pricing">
        <div className="pricing-heading"><div><span className="kicker">04 / DOMAIN & HOSTING</span><h2>Infrastructure,<br /><em>without hidden ownership.</em></h2></div><p>Domain dan cloud adalah biaya berulang. Akun dan kepemilikan tetap atas nama customer; RETECH membantu setup dan pengelolaannya.</p></div>
        <div className="hosting-grid">{hosting.map((item) => <article key={item.name}><span>OPTIONAL ADD-ON</span><h3>{item.name}</h3><strong>{item.price}</strong><p>{item.description}</p><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}</div>
        <p className="hosting-disclaimer">Harga perpanjangan mengikuti tarif registrar dan cloud provider. Pemakaian resource tinggi, storage besar, email hosting, lisensi, dan layanan pihak ketiga dihitung terpisah.</p>
      </section>
      <section className="pricing-notes">
        <div><span className="kicker">GOOD TO KNOW</span><h2>Scope before<br /><em>commitment.</em></h2></div>
        <div className="pricing-note-grid"><p><strong>Termasuk</strong>Discovery singkat, estimasi pekerjaan, testing, dan handover sesuai ruang lingkup.</p><p><strong>Belum termasuk</strong>Hosting, domain, akun developer, biaya store, lisensi, layanan pihak ketiga, pajak, dan pekerjaan di luar scope.</p><p><strong>Store publishing</strong>RETECH membantu menyiapkan build dan submission. Customer menyediakan akun Google Play atau Apple Developer dan menyelesaikan verifikasi.</p><p><strong>Maintenance</strong>Garansi bug berbeda dari fitur baru. Maintenance lanjutan dibuat sebagai paket terpisah.</p><p><strong>Kepemilikan</strong>Domain, cloud, dan akun store didaftarkan atas nama customer, bukan akun pribadi RETECH.</p><p><strong>Ketersediaan</strong>Jadwal dan response time dikonfirmasi sebelum pekerjaan dimulai. Layanan 24/7 tidak termasuk.</p></div>
      </section>
      <section className="pricing-cta"><span className="kicker">GET A REAL ESTIMATE</span><h2>Ceritakan kebutuhan.<br /><em>Kami bantu petakan.</em></h2><p>Konsultasi awal membantu menentukan pendekatan, prioritas, biaya, dan timeline yang paling masuk akal.</p><Link className="button button-primary" href="/#contact">Request quotation <span>↗</span></Link></section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
