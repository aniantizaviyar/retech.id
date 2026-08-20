import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi PT. Retech Digital Solution mengenai pengumpulan, penggunaan, penyimpanan, keamanan, dan hak pemilik data.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    type: "website",
    url: "/privacy-policy",
    title: "Kebijakan Privasi | RETECH",
    description: "Cara RETECH memproses dan melindungi data ketika Anda menggunakan retech.id.",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image", title: "Kebijakan Privasi | RETECH", images: ["/og.png"] },
};

const sections = [
  ["01", "Ruang lingkup", "scope"],
  ["02", "Data yang diproses", "data"],
  ["03", "Tujuan dan dasar", "purpose"],
  ["04", "Penyedia layanan", "providers"],
  ["05", "Keamanan data", "security"],
  ["06", "Retensi data", "retention"],
  ["07", "Hak Anda", "rights"],
  ["08", "Kontak dan perubahan", "contact"],
] as const;

export default function PrivacyPolicyPage() {
  const pageUrl = "https://retech.id/privacy-policy";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Kebijakan Privasi RETECH",
    description: "Informasi pemrosesan dan perlindungan data pada website RETECH.",
    inLanguage: "id-ID",
    isPartOf: { "@id": "https://retech.id/#website" },
    about: { "@id": "https://retech.id/#organization" },
    dateModified: "2026-08-20",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader />

      <section className="privacy-hero">
        <span className="kicker">PRIVACY AT RETECH</span>
        <h1>Transparan tentang data.<br /><em>Serius soal keamanannya.</em></h1>
        <div className="privacy-hero-meta">
          <p>
            Kebijakan ini menjelaskan bagaimana PT. Retech Digital Solution
            (&quot;RETECH&quot;, &quot;kami&quot;) memproses data ketika Anda mengakses
            retech.id, menggunakan assistant, atau mengirim inquiry.
          </p>
          <span>Terakhir diperbarui<br /><strong>20 Agustus 2026</strong></span>
        </div>
      </section>

      <section className="privacy-layout">
        <aside aria-label="Daftar isi kebijakan privasi">
          <span>ON THIS PAGE</span>
          <nav>
            {sections.map(([number, title, id]) => <a key={id} href={`#${id}`}><i>{number}</i>{title}</a>)}
          </nav>
          <p>Untuk pertanyaan atau permintaan terkait data:</p>
          <a className="privacy-email" href="mailto:admin@retech.id">admin@retech.id ↗</a>
        </aside>

        <div className="privacy-content">
          <div className="privacy-summary">
            <strong>Ringkasan komitmen kami</strong>
            <p>RETECH tidak menjual atau menyewakan data pribadi. Kami mengumpulkan data yang relevan untuk menanggapi inquiry, menjaga keamanan layanan, dan memahami performa website.</p>
          </div>

          <article id="scope">
            <span>01</span><div>
              <h2>Ruang lingkup</h2>
              <p>Kebijakan ini berlaku untuk website retech.id, form kontak, form pada RETECH Assistant, serta komunikasi awal yang timbul dari kanal tersebut.</p>
              <p>Data yang diproses dalam pelaksanaan proyek customer dapat diatur lebih lanjut melalui proposal, kontrak, non-disclosure agreement, atau data processing agreement yang berlaku untuk proyek tersebut.</p>
            </div>
          </article>

          <article id="data">
            <span>02</span><div>
              <h2>Data yang kami proses</h2>
              <h3>Data yang Anda berikan</h3>
              <ul>
                <li>Nama serta nomor telepon atau WhatsApp.</li>
                <li>Layanan yang diminati dan uraian kebutuhan bisnis atau teknis.</li>
                <li>Isi korespondensi lanjutan yang Anda kirimkan melalui email atau kanal komunikasi lain.</li>
              </ul>
              <h3>Data teknis dan penggunaan</h3>
              <ul>
                <li>Halaman, waktu kunjungan, referrer, jenis perangkat, browser, lokasi umum, dan interaksi seperti klik atau scroll.</li>
                <li>Alamat IP dan user-agent yang digunakan secara terbatas untuk keamanan, log server, deteksi penyalahgunaan, dan rate limiting. Untuk pembatasan form, identitas teknis diubah menjadi fingerprint HMAC.</li>
                <li>Token verifikasi Cloudflare Turnstile untuk memastikan pengiriman form berasal dari pengguna yang sah.</li>
              </ul>
              <p className="privacy-callout">Jangan mencantumkan password, private key, data kartu pembayaran, data kesehatan, atau informasi sensitif lain di kolom kebutuhan.</p>
            </div>
          </article>

          <article id="purpose">
            <span>03</span><div>
              <h2>Tujuan dan dasar pemrosesan</h2>
              <p>Kami memproses data secara proporsional untuk:</p>
              <ul>
                <li>Menanggapi pertanyaan, menyusun estimasi, proposal, atau langkah pra-kontrak yang Anda minta.</li>
                <li>Menghubungi Anda terkait layanan yang dipilih dan mengelola hubungan bisnis.</li>
                <li>Menjaga keamanan, mencegah spam dan penyalahgunaan, serta menangani gangguan teknis.</li>
                <li>Mengukur performa website dan memperbaiki pengalaman pengguna menggunakan data agregat atau terbatas.</li>
                <li>Memenuhi kewajiban hukum, pembukuan, penyelesaian sengketa, atau perlindungan hak RETECH dan pihak lain.</li>
              </ul>
              <p>Dasar pemrosesan disesuaikan dengan konteks, termasuk persetujuan, permintaan untuk mengambil langkah pra-kontrak, pelaksanaan perjanjian, kewajiban hukum, atau kepentingan sah lain yang tetap memperhatikan hak pemilik data.</p>
            </div>
          </article>

          <article id="providers">
            <span>04</span><div>
              <h2>Penyedia layanan dan transfer data</h2>
              <p>Untuk menjalankan website, RETECH menggunakan penyedia layanan yang memproses data sesuai fungsi masing-masing:</p>
              <div className="provider-grid">
                <div><strong>Vercel</strong><p>Hosting, delivery aplikasi, log teknis, dan web analytics agregat.</p></div>
                <div><strong>Supabase</strong><p>Penyimpanan database inquiry serta fungsi rate limiting.</p></div>
                <div><strong>Cloudflare Turnstile</strong><p>Verifikasi keamanan form dan deteksi trafik otomatis.</p></div>
                <div><strong>Google Tag Manager</strong><p>Pengelolaan tag pengukuran interaksi website.</p></div>
                <div><strong>Microsoft Clarity</strong><p>Analisis pola penggunaan seperti klik, scroll, dan performa tampilan dengan masking pada input.</p></div>
                <div><strong>Email infrastructure</strong><p>Pengiriman notifikasi inquiry dan komunikasi tindak lanjut, termasuk relay email Brevo.</p></div>
              </div>
              <p>Beberapa penyedia dapat memproses data pada infrastruktur di luar Indonesia. Kami membatasi data yang dikirim sesuai kebutuhan layanan dan menerapkan perlindungan kontraktual atau teknis yang tersedia.</p>
              <p>Kami dapat membuka data jika diwajibkan oleh hukum, perintah otoritas yang sah, atau diperlukan untuk melindungi keamanan dan hak hukum. Kami tidak menjual data pribadi untuk kepentingan pihak ketiga.</p>
            </div>
          </article>

          <article id="security">
            <span>05</span><div>
              <h2>Keamanan data</h2>
              <p>Kami menggunakan langkah teknis dan organisasi yang disesuaikan dengan risiko, antara lain:</p>
              <ul>
                <li>Enkripsi koneksi HTTPS/TLS dan pengelolaan secret di sisi server.</li>
                <li>Validasi input di browser dan server, honeypot, Turnstile, serta rate limiting.</li>
                <li>Kontrol akses berbasis kebutuhan, pembatasan hak database, logging, dan monitoring.</li>
                <li>Header keamanan browser, pembatasan sumber konten, pemeliharaan, serta pembaruan sistem.</li>
                <li>Masking informasi sensitif dalam case study dan elemen form pada session analytics.</li>
              </ul>
              <p>Tidak ada sistem yang dapat menjamin keamanan mutlak. Jika terjadi insiden, kami akan menilai dampaknya, melakukan pengendalian, dan memberikan pemberitahuan sesuai kewajiban yang berlaku.</p>
            </div>
          </article>

          <article id="retention">
            <span>06</span><div>
              <h2>Retensi data</h2>
              <p>Data disimpan selama diperlukan untuk menindaklanjuti inquiry, menjaga catatan hubungan bisnis, memenuhi kewajiban hukum, dan menangani sengketa atau keamanan. Masa penyimpanan dapat berbeda berdasarkan jenis data, status komunikasi, kewajiban kontraktual, serta kebutuhan operasional.</p>
              <p>Ketika tidak lagi diperlukan, data akan dihapus, dianonimkan, atau aksesnya dibatasi secara wajar. Log keamanan dan data analytics dapat memiliki masa retensi yang berbeda sesuai konfigurasi penyedia layanan.</p>
            </div>
          </article>

          <article id="rights">
            <span>07</span><div>
              <h2>Hak Anda</h2>
              <p>Sesuai ketentuan yang berlaku, Anda dapat meminta:</p>
              <ul>
                <li>Informasi, akses, dan salinan data pribadi yang kami kelola.</li>
                <li>Perbaikan atau pembaruan data yang tidak akurat.</li>
                <li>Penghentian pemrosesan, pembatasan, penghapusan, atau pemusnahan data.</li>
                <li>Penarikan persetujuan atau keberatan terhadap pemrosesan tertentu.</li>
                <li>Portabilitas data dalam format yang lazim digunakan apabila berlaku.</li>
              </ul>
              <p>Kami dapat meminta informasi yang wajar untuk memverifikasi identitas sebelum memenuhi permintaan. Hak tertentu dapat dibatasi apabila penyimpanan atau pemrosesan masih diwajibkan oleh hukum atau diperlukan untuk pembelaan hak hukum.</p>
            </div>
          </article>

          <article id="contact">
            <span>08</span><div>
              <h2>Kontak dan perubahan kebijakan</h2>
              <p>Kirim pertanyaan, keluhan, atau permintaan terkait data ke <a href="mailto:admin@retech.id">admin@retech.id</a>. Sertakan informasi yang cukup agar kami dapat mengidentifikasi permintaan tanpa mengirimkan data sensitif yang tidak diperlukan.</p>
              <p>Kebijakan ini dapat diperbarui untuk mencerminkan perubahan layanan, teknologi, penyedia, atau ketentuan hukum. Tanggal pembaruan terbaru akan ditampilkan di bagian atas halaman.</p>
              <Link className="privacy-back" href="/">Kembali ke halaman utama <span>↗</span></Link>
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
