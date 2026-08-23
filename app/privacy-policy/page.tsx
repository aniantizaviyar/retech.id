import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPageContent } from "@/lib/cms-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/privacy-policy");
  const title = en ? "Privacy Policy" : "Kebijakan Privasi";
  const description = en ? "PT. Retech Digital Solution Privacy Policy covering data collection, use, storage, security, and data-subject rights." : "Kebijakan Privasi PT. Retech Digital Solution mengenai pengumpulan, penggunaan, penyimpanan, keamanan, dan hak pemilik data.";
  return { title, description, alternates: { canonical, languages: languageAlternates("/privacy-policy") }, openGraph: { type: "website", url: canonical, title: `${title} | RETECH`, description, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: `${title} | RETECH`, description, images: ["/og.png"] } };
}

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

const englishSections = [
  ["01", "Scope", "scope"], ["02", "Data we process", "data"], ["03", "Purpose and legal basis", "purpose"], ["04", "Service providers", "providers"],
  ["05", "Data security", "security"], ["06", "Data retention", "retention"], ["07", "Your rights", "rights"], ["08", "Contact and changes", "contact"],
] as const;

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const localizedSections = en ? englishSections : sections;
  const pageContent = await getPageContent("privacy-policy", locale);
  const pageUrl = absoluteLocaleUrl(locale, "/privacy-policy");
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: en ? "RETECH Privacy Policy" : "Kebijakan Privasi RETECH",
    description: en ? "Information about data processing and protection on the RETECH website." : "Informasi pemrosesan dan perlindungan data pada website RETECH.",
    inLanguage: localeConfig[locale].schemaLang,
    isPartOf: { "@id": "https://retech.id/#website" },
    about: { "@id": "https://retech.id/#organization" },
    dateModified: "2026-08-20",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />

      <section className="privacy-hero">
        <span className="kicker">PRIVACY AT RETECH</span>
        <h1>{en ? "Transparent about data." : "Transparan tentang data."}<br /><em>{en ? "Serious about security." : "Serius soal keamanannya."}</em></h1>
        <div className="privacy-hero-meta">
          <p>{String(pageContent.intro || "")}</p>
          <span>{en ? "Last updated" : "Terakhir diperbarui"}<br /><strong>{en ? "August 20, 2026" : "20 Agustus 2026"}</strong></span>
        </div>
      </section>

      <section className="privacy-layout">
        <aside aria-label={en ? "Privacy policy table of contents" : "Daftar isi kebijakan privasi"}>
          <span>ON THIS PAGE</span>
          <nav>
            {localizedSections.map(([number, title, id]) => <a key={id} href={`#${id}`}><i>{number}</i>{title}</a>)}
          </nav>
          <p>{en ? "For questions or requests about your data:" : "Untuk pertanyaan atau permintaan terkait data:"}</p>
          <a className="privacy-email" href="mailto:admin@retech.id">admin@retech.id ↗</a>
        </aside>

        <div className="privacy-content">
          <div className="privacy-summary">
            <strong>{en ? "Our commitment at a glance" : "Ringkasan komitmen kami"}</strong>
            <p>{String(pageContent.summary || "")}</p>
          </div>

          <article id="scope">
            <span>01</span><div>
              <h2>{en ? "Scope" : "Ruang lingkup"}</h2>
              <p>{en ? "This policy applies to the retech.id website, contact form, RETECH Assistant form, and initial communications arising from those channels." : "Kebijakan ini berlaku untuk website retech.id, form kontak, form pada RETECH Assistant, serta komunikasi awal yang timbul dari kanal tersebut."}</p>
              <p>{en ? "Data processed while delivering a customer project may be governed further by the applicable proposal, contract, non-disclosure agreement, or data processing agreement." : "Data yang diproses dalam pelaksanaan proyek customer dapat diatur lebih lanjut melalui proposal, kontrak, non-disclosure agreement, atau data processing agreement yang berlaku untuk proyek tersebut."}</p>
            </div>
          </article>

          <article id="data">
            <span>02</span><div>
              <h2>{en ? "Data we process" : "Data yang kami proses"}</h2>
              <h3>{en ? "Data you provide" : "Data yang Anda berikan"}</h3>
              <ul>
                <li>{en ? "Your name and telephone or WhatsApp number." : "Nama serta nomor telepon atau WhatsApp."}</li>
                <li>{en ? "The service you are interested in and a description of your business or technical requirements." : "Layanan yang diminati dan uraian kebutuhan bisnis atau teknis."}</li>
                <li>{en ? "The content of follow-up correspondence you send by email or another communication channel." : "Isi korespondensi lanjutan yang Anda kirimkan melalui email atau kanal komunikasi lain."}</li>
              </ul>
              <h3>{en ? "Technical and usage data" : "Data teknis dan penggunaan"}</h3>
              <ul>
                <li>{en ? "Pages viewed, visit time, referrer, device type, browser, general location, and interactions such as clicks or scrolling." : "Halaman, waktu kunjungan, referrer, jenis perangkat, browser, lokasi umum, dan interaksi seperti klik atau scroll."}</li>
                <li>{en ? "IP address and user-agent used on a limited basis for security, server logs, abuse detection, and rate limiting. For form limits, the technical identity is converted into an HMAC fingerprint." : "Alamat IP dan user-agent yang digunakan secara terbatas untuk keamanan, log server, deteksi penyalahgunaan, dan rate limiting. Untuk pembatasan form, identitas teknis diubah menjadi fingerprint HMAC."}</li>
                <li>{en ? "A Cloudflare Turnstile verification token to confirm that a form submission comes from a legitimate user." : "Token verifikasi Cloudflare Turnstile untuk memastikan pengiriman form berasal dari pengguna yang sah."}</li>
              </ul>
              <p className="privacy-callout">{en ? "Do not include passwords, private keys, payment-card data, health data, or other sensitive information in the requirements field." : "Jangan mencantumkan password, private key, data kartu pembayaran, data kesehatan, atau informasi sensitif lain di kolom kebutuhan."}</p>
            </div>
          </article>

          <article id="purpose">
            <span>03</span><div>
              <h2>{en ? "Purpose and legal basis" : "Tujuan dan dasar pemrosesan"}</h2>
              <p>{en ? "We process data proportionately to:" : "Kami memproses data secara proporsional untuk:"}</p>
              <ul>
                <li>{en ? "Respond to questions and prepare estimates, proposals, or pre-contract steps you request." : "Menanggapi pertanyaan, menyusun estimasi, proposal, atau langkah pra-kontrak yang Anda minta."}</li>
                <li>{en ? "Contact you about the selected service and manage the business relationship." : "Menghubungi Anda terkait layanan yang dipilih dan mengelola hubungan bisnis."}</li>
                <li>{en ? "Maintain security, prevent spam and abuse, and resolve technical disruptions." : "Menjaga keamanan, mencegah spam dan penyalahgunaan, serta menangani gangguan teknis."}</li>
                <li>{en ? "Measure website performance and improve the user experience using aggregated or limited data." : "Mengukur performa website dan memperbaiki pengalaman pengguna menggunakan data agregat atau terbatas."}</li>
                <li>{en ? "Meet legal, accounting, dispute-resolution, or rights-protection obligations for RETECH and others." : "Memenuhi kewajiban hukum, pembukuan, penyelesaian sengketa, atau perlindungan hak RETECH dan pihak lain."}</li>
              </ul>
              <p>{en ? "The legal basis depends on context and may include consent, a request to take pre-contract steps, performance of an agreement, a legal obligation, or another legitimate interest that respects data-subject rights." : "Dasar pemrosesan disesuaikan dengan konteks, termasuk persetujuan, permintaan untuk mengambil langkah pra-kontrak, pelaksanaan perjanjian, kewajiban hukum, atau kepentingan sah lain yang tetap memperhatikan hak pemilik data."}</p>
            </div>
          </article>

          <article id="providers">
            <span>04</span><div>
              <h2>{en ? "Service providers and data transfers" : "Penyedia layanan dan transfer data"}</h2>
              <p>{en ? "To operate the website, RETECH uses service providers that process data for their respective functions:" : "Untuk menjalankan website, RETECH menggunakan penyedia layanan yang memproses data sesuai fungsi masing-masing:"}</p>
              <div className="provider-grid">
                <div><strong>Vercel</strong><p>{en ? "Hosting, application delivery, technical logs, and aggregated web analytics." : "Hosting, delivery aplikasi, log teknis, dan web analytics agregat."}</p></div>
                <div><strong>Supabase</strong><p>{en ? "Inquiry database storage and rate-limiting functions." : "Penyimpanan database inquiry serta fungsi rate limiting."}</p></div>
                <div><strong>Cloudflare Turnstile</strong><p>{en ? "Form security verification and automated-traffic detection." : "Verifikasi keamanan form dan deteksi trafik otomatis."}</p></div>
                <div><strong>Google Tag Manager</strong><p>{en ? "Management of website-interaction measurement tags." : "Pengelolaan tag pengukuran interaksi website."}</p></div>
                <div><strong>Microsoft Clarity</strong><p>{en ? "Analysis of usage patterns such as clicks, scrolling, and display performance, with input masking." : "Analisis pola penggunaan seperti klik, scroll, dan performa tampilan dengan masking pada input."}</p></div>
                <div><strong>Email infrastructure</strong><p>{en ? "Inquiry notifications and follow-up communications, including the Brevo email relay." : "Pengiriman notifikasi inquiry dan komunikasi tindak lanjut, termasuk relay email Brevo."}</p></div>
              </div>
              <p>{en ? "Some providers may process data on infrastructure outside Indonesia. We limit transferred data to what the service needs and apply available contractual or technical safeguards." : "Beberapa penyedia dapat memproses data pada infrastruktur di luar Indonesia. Kami membatasi data yang dikirim sesuai kebutuhan layanan dan menerapkan perlindungan kontraktual atau teknis yang tersedia."}</p>
              <p>{en ? "We may disclose data when required by law, ordered by a lawful authority, or necessary to protect security and legal rights. We do not sell personal data for third-party purposes." : "Kami dapat membuka data jika diwajibkan oleh hukum, perintah otoritas yang sah, atau diperlukan untuk melindungi keamanan dan hak hukum. Kami tidak menjual data pribadi untuk kepentingan pihak ketiga."}</p>
            </div>
          </article>

          <article id="security">
            <span>05</span><div>
              <h2>{en ? "Data security" : "Keamanan data"}</h2>
              <p>{en ? "We use technical and organizational measures proportionate to risk, including:" : "Kami menggunakan langkah teknis dan organisasi yang disesuaikan dengan risiko, antara lain:"}</p>
              <ul>
                <li>{en ? "HTTPS/TLS connection encryption and server-side secret management." : "Enkripsi koneksi HTTPS/TLS dan pengelolaan secret di sisi server."}</li>
                <li>{en ? "Browser- and server-side input validation, honeypots, Turnstile, and rate limiting." : "Validasi input di browser dan server, honeypot, Turnstile, serta rate limiting."}</li>
                <li>{en ? "Need-based access controls, restricted database privileges, logging, and monitoring." : "Kontrol akses berbasis kebutuhan, pembatasan hak database, logging, dan monitoring."}</li>
                <li>{en ? "Browser security headers, content-source restrictions, maintenance, and system updates." : "Header keamanan browser, pembatasan sumber konten, pemeliharaan, serta pembaruan sistem."}</li>
                <li>{en ? "Masking of sensitive information in case studies and form elements in session analytics." : "Masking informasi sensitif dalam case study dan elemen form pada session analytics."}</li>
              </ul>
              <p>{en ? "No system can guarantee absolute security. If an incident occurs, we will assess its impact, contain it, and provide notifications as required by applicable obligations." : "Tidak ada sistem yang dapat menjamin keamanan mutlak. Jika terjadi insiden, kami akan menilai dampaknya, melakukan pengendalian, dan memberikan pemberitahuan sesuai kewajiban yang berlaku."}</p>
            </div>
          </article>

          <article id="retention">
            <span>06</span><div>
              <h2>{en ? "Data retention" : "Retensi data"}</h2>
              <p>{en ? "Data is retained as needed to follow up inquiries, keep business-relationship records, meet legal obligations, and address disputes or security matters. Retention periods vary by data type, communication status, contractual obligations, and operational needs." : "Data disimpan selama diperlukan untuk menindaklanjuti inquiry, menjaga catatan hubungan bisnis, memenuhi kewajiban hukum, dan menangani sengketa atau keamanan. Masa penyimpanan dapat berbeda berdasarkan jenis data, status komunikasi, kewajiban kontraktual, serta kebutuhan operasional."}</p>
              <p>{en ? "When no longer needed, data will be deleted, anonymized, or access will be reasonably restricted. Security logs and analytics data may have different retention periods based on provider configuration." : "Ketika tidak lagi diperlukan, data akan dihapus, dianonimkan, atau aksesnya dibatasi secara wajar. Log keamanan dan data analytics dapat memiliki masa retensi yang berbeda sesuai konfigurasi penyedia layanan."}</p>
            </div>
          </article>

          <article id="rights">
            <span>07</span><div>
              <h2>{en ? "Your rights" : "Hak Anda"}</h2>
              <p>{en ? "Subject to applicable law, you may request:" : "Sesuai ketentuan yang berlaku, Anda dapat meminta:"}</p>
              <ul>
                <li>{en ? "Information about, access to, and a copy of personal data we manage." : "Informasi, akses, dan salinan data pribadi yang kami kelola."}</li>
                <li>{en ? "Correction or updating of inaccurate data." : "Perbaikan atau pembaruan data yang tidak akurat."}</li>
                <li>{en ? "Cessation, restriction, deletion, or destruction of data processing." : "Penghentian pemrosesan, pembatasan, penghapusan, atau pemusnahan data."}</li>
                <li>{en ? "Withdrawal of consent or objection to certain processing." : "Penarikan persetujuan atau keberatan terhadap pemrosesan tertentu."}</li>
                <li>{en ? "Data portability in a commonly used format where applicable." : "Portabilitas data dalam format yang lazim digunakan apabila berlaku."}</li>
              </ul>
              <p>{en ? "We may request reasonable information to verify identity before fulfilling a request. Certain rights may be limited where retention or processing remains legally required or is necessary to defend legal rights." : "Kami dapat meminta informasi yang wajar untuk memverifikasi identitas sebelum memenuhi permintaan. Hak tertentu dapat dibatasi apabila penyimpanan atau pemrosesan masih diwajibkan oleh hukum atau diperlukan untuk pembelaan hak hukum."}</p>
            </div>
          </article>

          <article id="contact">
            <span>08</span><div>
              <h2>{en ? "Contact and policy changes" : "Kontak dan perubahan kebijakan"}</h2>
              <p>{en ? "Send data-related questions, complaints, or requests to " : "Kirim pertanyaan, keluhan, atau permintaan terkait data ke "}<a href="mailto:admin@retech.id">admin@retech.id</a>. {en ? "Include enough information for us to identify the request without sending unnecessary sensitive data." : "Sertakan informasi yang cukup agar kami dapat mengidentifikasi permintaan tanpa mengirimkan data sensitif yang tidak diperlukan."}</p>
              <p>{en ? "This policy may be updated to reflect changes in services, technology, providers, or legal requirements. The latest revision date will appear at the top of the page." : "Kebijakan ini dapat diperbarui untuk mencerminkan perubahan layanan, teknologi, penyedia, atau ketentuan hukum. Tanggal pembaruan terbaru akan ditampilkan di bagian atas halaman."}</p>
              <Link className="privacy-back" href={localePath(locale, "/")}>{en ? "Back to homepage" : "Kembali ke halaman utama"} <span>↗</span></Link>
            </div>
          </article>
        </div>
      </section>

      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
