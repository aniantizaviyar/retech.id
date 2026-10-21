import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ChatWidget } from "@/app/ChatWidget";
import { companyContact } from "@/lib/company";
import { localePath, type Locale } from "@/lib/i18n";
import styles from "./AttendanceLanding.module.css";

const links = {
  app: "https://play.google.com/store/apps/details?id=com.absen.project",
  dashboard: "https://absensi.retech.id/",
  tutorial: "https://absensi.retech.id/tutorial/",
  privacy: "https://absensi.retech.id/kebijakan-privasi/",
  deletion: "https://absensi.retech.id/hapus-data/",
};

function Icon({ name }: { name: "pin" | "face" | "clock" | "calendar" | "report" | "team" | "shield" | "book" | "delete" }) {
  const paths = {
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    face: <><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" /><path d="M8 9h.01M16 9h.01M8 15c2 2 6 2 8 0" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5" /></>,
    report: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 16v-3m4 3v-5m4 5v-2" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-2-4" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    book: <><path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Zm0 0v15" /></>,
    delete: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AttendanceLanding({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const features = en ? [
    ["pin", "Attendance at the right location", "GPS and geofence validation check attendance against your company's approved work locations."],
    ["face", "Selfie and face verification", "Employees capture a selfie. Face matching supports identity checks against their company enrollment."],
    ["clock", "Shifts, including overnight work", "Company schedules and time zones guide check-in windows, lateness, and the active check-out session."],
    ["calendar", "Leave with a clear approval flow", "Pro supports one approval level; Business supports up to three. Supporting attachments are optional."],
    ["report", "History that is easy to review", "Employees see their calendar and attendance history. Authorized managers review attendance and reports."],
    ["team", "One company, defined access", "Each employee belongs to a verified company workspace, with access separated by membership and role."],
  ] : [
    ["pin", "Absen di lokasi yang tepat", "Validasi GPS dan geofence memeriksa absensi terhadap lokasi kerja yang ditetapkan perusahaan."],
    ["face", "Selfie dan verifikasi wajah", "Karyawan mengambil selfie. Pencocokan wajah membantu validasi identitas terhadap enrollment perusahaan."],
    ["clock", "Shift, termasuk lintas hari", "Jadwal dan zona waktu perusahaan mengatur rentang masuk, keterlambatan, serta sesi absen pulang."],
    ["calendar", "Izin dan cuti dengan alur jelas", "Pro mendukung satu tingkat persetujuan; Bisnis hingga tiga tingkat. Lampiran pendukung bersifat opsional."],
    ["report", "Riwayat yang mudah ditinjau", "Karyawan melihat kalender dan riwayat pribadi. Pengelola berwenang meninjau kehadiran dan laporan."],
    ["team", "Perusahaan dan akses terarah", "Karyawan terhubung ke ruang perusahaan yang terverifikasi, dengan pemisahan data dan hak akses sesuai peran."],
  ];
  const plans = [
    { name: "Free", price: "Rp0", unit: en ? "/ company / month" : "/ perusahaan / bulan", intro: en ? "A focused starting point for a small team." : "Langkah awal untuk tim kecil.", limits: en ? ["Up to 10 active employees", "1 location · 1 shift · 1 manager", "Selfie, GPS and face verification", "Attendance history and basic CSV", "Help centre and email support"] : ["Maksimal 10 karyawan aktif", "1 lokasi · 1 shift · 1 pengelola", "Selfie, GPS dan verifikasi wajah", "Riwayat dan ekspor CSV dasar", "Pusat bantuan dan email"] },
    { name: "Pro", price: "Rp12.500", unit: en ? "/ employee seat / month" : "/ slot karyawan / bulan", intro: en ? "For teams managing attendance and leave." : "Untuk operasional kehadiran dan izin/cuti.", limits: en ? ["Employee capacity by purchased seats", "3 locations · 10 shifts · 3 managers", "Core attendance and company dashboard", "Leave with 1 approval level", "Support during business hours"] : ["Kapasitas sesuai slot yang dibeli", "3 lokasi · 10 shift · 3 pengelola", "Absensi inti dan dashboard perusahaan", "Izin/cuti dengan 1 persetujuan", "Dukungan pada jam kerja"], featured: true },
    { name: en ? "Business" : "Bisnis", price: "Rp20.000", unit: en ? "/ employee seat / month" : "/ slot karyawan / bulan", intro: en ? "More capacity and layered approvals." : "Kuota lebih besar dan persetujuan berjenjang.", limits: en ? ["Employee capacity by purchased seats", "10 locations · 30 shifts · 10 managers", "Core attendance and company dashboard", "Leave with 1–3 approval levels", "Priority support during business hours"] : ["Kapasitas sesuai slot yang dibeli", "10 lokasi · 30 shift · 10 pengelola", "Absensi inti dan dashboard perusahaan", "Izin/cuti dengan 1–3 persetujuan", "Prioritas dukungan pada jam kerja"] },
  ];
  const help = [
    { icon: "book" as const, title: en ? "User tutorial" : "Tutorial pengguna", copy: en ? "Learn account access, attendance, company workspaces and daily use." : "Pelajari akses akun, absensi, ruang perusahaan, dan penggunaan harian.", href: links.tutorial },
    { icon: "shield" as const, title: en ? "ReTendance privacy" : "Privasi ReTendance", copy: en ? "Read how account, photo, location and attendance data are handled." : "Baca pengelolaan data akun, foto, lokasi, dan catatan kehadiran.", href: links.privacy },
    { icon: "delete" as const, title: en ? "Account and data deletion" : "Hapus akun dan data", copy: en ? "Find the request process without needing to log in or reinstall the app." : "Temukan jalur permintaan tanpa harus login atau memasang ulang aplikasi.", href: links.deletion },
  ];
  const faqs = en ? [
    ["Is the Android app available?", "Yes. Download ReTendance through the official Google Play link. The app complements your verified company workspace; installing it does not automatically activate a paid plan."],
    ["How are paid seats calculated?", "A purchased seat provides attendance capacity for one active company membership. For example, 30 Pro seats cost Rp375,000 per month. Free's 10 seats are not deducted from paid-plan billing."],
    ["Are checkout and renewal automatic?", "Plan, seats and billing period are confirmed during onboarding. Payments currently follow the agreed quotation/invoice and verification process. This page does not initiate an automatic charge."],
    ["Does face verification guarantee that fraud is impossible?", "No. Face matching, location checks and device signals support attendance validation. They do not guarantee perfect anti-spoofing, and authorized staff can review exceptions."],
    ["Are daily reminders already available?", "Scheduled daily attendance reminders are not yet available. Notification permission is optional and declining it does not block core attendance features."],
  ] : [
    ["Apakah aplikasi Android sudah tersedia?", "Ya. Unduh ReTendance melalui tautan resmi Google Play. Aplikasi merupakan pendamping ruang perusahaan yang terverifikasi; instalasi tidak otomatis mengaktifkan paket berbayar."],
    ["Bagaimana slot berbayar dihitung?", "Satu slot yang dibeli menyediakan kapasitas absensi untuk satu keanggotaan aktif dalam perusahaan. Contoh: 30 slot Pro = Rp375.000/bulan. Sepuluh slot Free tidak dipotong dari tagihan paket berbayar."],
    ["Apakah pembayaran dan perpanjangan sudah otomatis?", "Paket, jumlah slot, dan periode dikonfirmasi saat onboarding. Pembayaran mengikuti quotation/invoice dan proses verifikasi yang disepakati. Halaman ini tidak menjalankan penagihan otomatis."],
    ["Apakah verifikasi wajah menjamin tidak ada kecurangan?", "Tidak. Pencocokan wajah, pemeriksaan lokasi, dan sinyal perangkat membantu validasi kehadiran. Sistem tidak menjamin anti-spoof sempurna, dan pengecualian dapat ditinjau petugas berwenang."],
    ["Apakah pengingat absensi harian sudah tersedia?", "Pengingat absensi harian terjadwal belum tersedia. Izin notifikasi bersifat opsional; menolaknya tidak menghalangi fungsi inti absensi."],
  ];
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ReTendance", applicationCategory: "BusinessApplication", operatingSystem: "Android, Web", url: `https://retech.id${localePath(locale, "/products/attendance")}`, downloadUrl: links.app, softwareVersion: "1.11.1", provider: { "@type": "Organization", name: "PT. Retech Digital Solution", url: "https://retech.id" } };
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <SiteHeader locale={locale} />
    <article className={styles.content}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Link className={styles.back} href={localePath(locale, "/products")}>← {en ? "All products" : "Semua produk"}</Link>
          <div className={styles.brand}><Image src="/attendance/retendance-logo.png" alt="ReTendance" width={58} height={58} /><div><span>RETECH / WORKFORCE ATTENDANCE</span><strong>ReTendance</strong></div></div>
          <h1>{en ? "Clear attendance." : "Absensi jelas."}<br /><em>{en ? "A more focused team." : "Tim lebih terarah."}</em></h1>
          <p>{en ? "Selfie and location-based attendance, overnight shifts, employee history, and leave approvals—connected to your company dashboard." : "Absensi selfie dan lokasi, shift lintas hari, riwayat karyawan, serta persetujuan izin/cuti—terhubung ke dashboard perusahaan."}</p>
          <div className={styles.heroActions}><a href={links.app} target="_blank" rel="noreferrer" aria-label={en ? "Download ReTendance on Google Play" : "Unduh ReTendance di Google Play"} data-analytics="product_download_click" data-analytics-source="attendance_hero"><Image src="/attendance/google-play-id.png" alt="Dapatkan di Google Play" width={192} height={74} unoptimized /></a><a className={styles.secondaryButton} href="#paket">{en ? "Explore plans" : "Lihat paket"} ↗</a></div>
          <div className={styles.heroNote}><span /> Android 1.11.1 <i>·</i> {en ? "Released 21 October 2026" : "Rilis 21 Oktober 2026"}</div>
          <a className={styles.dashboardLink} href={links.dashboard} target="_blank" rel="noreferrer">{en ? "Already have a company workspace? Open dashboard" : "Sudah punya ruang perusahaan? Buka dashboard"} ↗</a>
        </div>
        <div className={styles.heroVisual} aria-label={en ? "Illustrative attendance interface" : "Ilustrasi antarmuka absensi"}>
          <div className={styles.visualLabel}>{en ? "ONE DAILY WORKFLOW" : "SATU ALUR KERJA HARIAN"}<span>ANDROID + WEB</span></div>
          <div className={styles.phone}><div className={styles.phoneTop}><span>09:41</span><span>● ▰</span></div><div className={styles.phoneCompany}><Icon name="team" /><span>{en ? "Your company" : "Perusahaan Anda"}</span><b>⌑</b></div><h3>{en ? "Hello, team." : "Halo, Tim."}</h3><p>{en ? "Ready for today's work." : "Siap untuk aktivitas hari ini."}</p><div className={styles.dailyCard}><span>{en ? "TODAY'S FOCUS" : "FOKUS HARI INI"}</span><h4>Shift 1</h4><strong>07:00 — 15:00</strong><div><p>{en ? "Check-in" : "Masuk"}<b>--:--</b></p><p>{en ? "Check-out" : "Pulang"}<b>--:--</b></p></div><span className={styles.demoButton}>↪ {en ? "Check in" : "Absen masuk"}</span></div><div className={styles.phoneBottom}><span>⌂<b>{en ? "Home" : "Beranda"}</b></span><span>▦<b>{en ? "History" : "Kehadiran"}</b></span><span>▤<b>{en ? "Requests" : "Pengajuan"}</b></span><span>◉<b>{en ? "Account" : "Akun"}</b></span></div></div>
          <div className={styles.signalCard}><Icon name="shield" /><div><strong>{en ? "Company workspace" : "Ruang perusahaan"}</strong><span>{en ? "Verified membership and role" : "Keanggotaan dan peran terverifikasi"}</span></div></div>
          <p className={styles.illustrationLabel}>{en ? "Illustrative interface with example data" : "Ilustrasi antarmuka dengan data contoh"}</p>
        </div>
      </section>
      <div className={styles.trustStrip}><span><Icon name="pin" />GPS & geofence</span><span><Icon name="face" />{en ? "Face verification" : "Verifikasi wajah"}</span><span><Icon name="clock" />{en ? "Overnight shifts" : "Shift lintas hari"}</span><span><Icon name="team" />{en ? "Company dashboard" : "Dashboard perusahaan"}</span></div>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>01 / DAILY OPERATIONS</span><h2>{en ? "The essentials, connected." : "Kebutuhan harian, terhubung."}</h2></div><p>{en ? "One employee app and a company workspace for authorized managers. Clear actions for employees, useful information for the team." : "Satu aplikasi karyawan dan ruang perusahaan bagi pengelola berwenang. Aksi jelas untuk karyawan, informasi berguna untuk tim."}</p></div>
        <div className={styles.features}>{features.map(([icon,title,copy]) => <article key={title}><span className={styles.icon}><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className={styles.workflow}><div><span className={styles.eyebrow}>02 / FROM SETUP TO ATTENDANCE</span><h2>{en ? "A simple flow for both sides." : "Alur sederhana untuk kedua sisi."}</h2><p>{en ? "Confirm your plan and company settings, connect your team, then manage daily attendance through the app and dashboard." : "Konfirmasi paket dan pengaturan perusahaan, hubungkan tim, lalu kelola kehadiran harian melalui aplikasi dan dashboard."}</p><a href={links.tutorial} target="_blank" rel="noreferrer">{en ? "Read the complete tutorial" : "Baca tutorial lengkap"} ↗</a></div><ol>{(en ? [["Set up the workspace", "Define your company, managers, locations and shifts."],["Connect employees", "Verify accounts and company membership; prepare face enrollment."],["Run daily attendance", "Employees check in/out; managers review history and requests."]] : [["Siapkan ruang perusahaan", "Tentukan perusahaan, pengelola, lokasi, dan shift."],["Hubungkan karyawan", "Verifikasi akun dan keanggotaan; siapkan enrollment wajah."],["Jalankan aktivitas harian", "Karyawan absen masuk/pulang; pengelola meninjau riwayat dan pengajuan."]]).map(([title,copy],index)=><li key={title}><b>0{index+1}</b><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
      <section className={styles.pricing} id="paket"><div className={styles.sectionHeading}><div><span className={styles.eyebrow}>03 / COMPANY PLANS</span><h2>{en ? "Start small. Add capacity when needed." : "Mulai kecil. Tambah kapasitas saat perlu."}</h2></div><p>{en ? "Monthly catalog pricing. Confirm the plan, seat count and activation scope with the RETECH team during onboarding." : "Harga katalog bulanan. Konfirmasikan paket, jumlah slot, dan cakupan aktivasi bersama tim RETECH saat onboarding."}</p></div><div className={styles.plans}>{plans.map(plan=><article key={plan.name} className={plan.featured ? styles.featuredPlan : ""}>{plan.featured && <span className={styles.planBadge}>{en ? "FOR GROWING TEAMS" : "UNTUK TIM BERKEMBANG"}</span>}<h3>{plan.name}</h3><p>{plan.intro}</p><div className={styles.price}><strong>{plan.price}</strong><span>{plan.unit}</span></div><ul>{plan.limits.map(limit=><li key={limit}>✓ <span>{limit}</span></li>)}</ul><a href={en ? companyContact.whatsappUrlEn : companyContact.whatsappUrl} target="_blank" rel="noreferrer">{en ? `Discuss ${plan.name}` : `Diskusikan ${plan.name}`} ↗</a></article>)}</div><div className={styles.pricingNotes}><strong>{en ? "Example: 30 Pro seats = Rp375,000 / month." : "Contoh: 30 slot Pro = Rp375.000 / bulan."}</strong><p>{en ? "Paid plans are billed by purchased attendance capacity. There is no mandatory block of 50 seats. Onboarding, custom work and integrations are quoted when needed. Advanced catalog items are confirmed by scope; downloading the app does not activate them automatically." : "Paket berbayar dihitung dari kapasitas absensi yang dibeli. Tidak ada blok wajib 50 slot. Onboarding, pekerjaan khusus, dan integrasi ditawarkan sesuai kebutuhan. Fitur lanjutan dikonfirmasi dalam scope; mengunduh aplikasi tidak mengaktifkannya otomatis."}</p></div></section>
      <section className={styles.support} id="bantuan"><div className={styles.supportIntro}><Image src="/attendance/app-guide.png" alt={en ? "ReTendance in-app welcome guide" : "Panduan sambutan di aplikasi ReTendance"} width={720} height={1280} /><div><span className={styles.eyebrow}>04 / HELP & PRIVACY</span><h2>{en ? "Help stays within reach." : "Bantuan tetap mudah dijangkau."}</h2><p>{en ? "A clear tutorial and public privacy resources support employees before and after they use the app." : "Tutorial yang jelas dan informasi privasi publik membantu karyawan sebelum maupun sesudah menggunakan aplikasi."}</p><small>{en ? "Account deletion requests remain available through the public support process. Self-service availability follows the account page." : "Permintaan penghapusan akun tetap tersedia melalui jalur dukungan publik. Ketersediaan formulir mandiri mengikuti halaman akun."}</small></div></div><div className={styles.helpCards}>{help.map(item=><a key={item.title} href={item.href} target="_blank" rel="noreferrer"><Icon name={item.icon} /><h3>{item.title}</h3><p>{item.copy}</p><span>{en ? "Open resource" : "Buka halaman"} ↗</span></a>)}</div></section>
      <section className={styles.faq}><div><span className={styles.eyebrow}>05 / GOOD TO KNOW</span><h2>{en ? "Before you get started." : "Sebelum mulai menggunakan."}</h2></div><div>{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
      <section className={styles.finalCta}><span className={styles.eyebrow}>RETECH / RETENDANCE</span><h2>{en ? "Make daily attendance easier to manage." : "Buat kehadiran harian lebih mudah dikelola."}</h2><p>{en ? "Tell us your team size, work locations and approval needs. We will help define a suitable starting point." : "Ceritakan jumlah tim, lokasi kerja, dan kebutuhan persetujuan Anda. Kami bantu menentukan langkah awal yang sesuai."}</p><Link className="button button-primary" href={localePath(locale, "/#contact")}>{en ? "Discuss your company" : "Diskusikan kebutuhan perusahaan"} ↗</Link><nav aria-label={en ? "ReTendance resources" : "Sumber daya ReTendance"}><a href={links.app} target="_blank" rel="noreferrer">Google Play ↗</a><a href={links.tutorial} target="_blank" rel="noreferrer">Tutorial ↗</a><a href={links.privacy} target="_blank" rel="noreferrer">{en ? "Privacy" : "Privasi"} ↗</a><a href={links.deletion} target="_blank" rel="noreferrer">{en ? "Account deletion" : "Hapus akun"} ↗</a></nav></section>
    </article><SiteFooter locale={locale} /><ChatWidget locale={locale} />
  </main>;
}
