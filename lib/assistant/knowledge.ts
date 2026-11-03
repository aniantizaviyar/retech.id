import "server-only";
import { getFaqs, getPricing, getProducts, getServices } from "../cms-data";
import { companyContact } from "../company";
import { ATTENDANCE_PRICES } from "../attendance-catalog";
import { getProjects } from "../projects";
import type { Locale } from "../i18n";
import type { CatalogItem, Document, Knowledge } from "./contracts";
import { parseCatalogPrice } from "./domain";

// Only published public content. Never import customer, invoice, mail or attendance API clients.
export async function loadKnowledge(
  locale: Locale,
  signal?: AbortSignal,
): Promise<Knowledge> {
  const deadline = AbortSignal.any([
    signal ?? new AbortController().signal,
    AbortSignal.timeout(5000),
  ]);
  const [services, products, pricing, faqs, projects] = await Promise.all([
    getServices(locale, deadline),
    getProducts(locale, deadline),
    getPricing(locale, deadline),
    getFaqs(locale, deadline),
    getProjects(locale, deadline),
  ]);
  const en = locale === "en";
  const serviceKeywords: Record<string, string[]> = {
    "digital-product-development": [
      "website",
      "web",
      "cms",
      "app",
      "mobile",
      "android",
      "ios",
      "aplikasi",
    ],
    "managed-it-services": [
      "server",
      "managed",
      "monitoring",
      "infrastructure",
      "infrastruktur",
      "backup",
      "maintenance",
    ],
    "remote-server-support": [
      "server",
      "migrasi",
      "migration",
      "instalasi",
      "installation",
      "hardening",
      "mail",
      "smtp",
      "deployment",
    ],
  };
  const documents: Document[] = services
    .slice(0, 20)
    .map((service) => ({
      id: `service:${service.slug}`,
      title: service.title.slice(0, 150),
      href: `/services/${service.slug}`,
      text: `${service.summary}\n${en ? "Includes" : "Cakupan"}: ${(service.includes ?? []).join("; ")}.`.slice(
        0,
        900,
      ),
      keywords: [
        service.slug,
        "layanan",
        "service",
        ...(serviceKeywords[service.slug] ?? []),
      ],
    }));
  for (const service of services.slice(0,20)) documents.push({
    id:`workflow:${service.slug}`,title:`${en?"Workflow":"Alur layanan"}: ${service.title}`.slice(0,150),href:`/services/${service.slug}`,
    text:(service.process??[]).map((step,i)=>`${i+1}. ${step.title}: ${step.description}`).join("\n").slice(0,1200),
    keywords:["workflow","alur","proses","tahapan",...(serviceKeywords[service.slug]??[])],
  });
  for (const project of projects.slice(0,20)) documents.push({
    id:`case:${project.slug}`,title:project.title.slice(0,150),href:`/work/${project.slug}`,
    text:`${project.summary}\n${en?"Challenge":"Tantangan"}: ${project.challenge}\n${en?"Solution":"Solusi"}: ${project.solution}\n${en?"Outcome":"Hasil"}: ${project.outcome}`.slice(0,1200),
    keywords:[project.slug,"case studies","portofolio",...project.services],
  });
  for (const product of products
    .filter((p) => p.slug !== "attendance")
    .slice(0, 20))
    documents.push({
      id: `product:${product.slug}`,
      title: product.title.slice(0, 150),
      href: `/products/${product.slug}`,
      text: `${product.summary} ${product.features
        .slice(0, 4)
        .map((f) => `${f.title}: ${f.copy}`)
        .join(". ")}`.slice(0, 1200),
      keywords: [
        product.slug,
        "produk",
        "product",
        "qr",
        "pos",
        "cafe",
        "restoran",
      ],
    });
  documents.push(
    {
      id: "migration",
      title: en ? "Server installation, migration & hardening" : "Instalasi, migrasi & hardening server",
      href: "/services/remote-server-support",
      keywords: ["migrasi", "migration", "mail server", "pindah server", "hardening", "instalasi"],
      text: en
        ? "RETECH provides remote server installation, migration, configuration and hardening support, including web stacks, databases, mail servers and SMTP relay. The team reviews requirements, access, impact and safeguards, executes changes step by step, then verifies results before handover. Migration scope, schedule, compatibility, backup/rollback arrangements and fees require an assessment and quotation; a monthly maintenance package is not automatically a migration price."
        : "RETECH menyediakan dukungan instalasi, migrasi, konfigurasi, dan hardening server secara remote, termasuk web stack, database, mail server, serta SMTP relay. Tim meninjau kebutuhan, akses, dampak, dan pengamanan, menjalankan perubahan bertahap, lalu memverifikasi hasil sebelum handover. Scope migrasi, jadwal, kompatibilitas, pengaturan backup/rollback, serta biaya perlu dikonfirmasi melalui assessment dan penawaran; harga maintenance bulanan bukan otomatis harga migrasi.",
    },
    {
      id: "about",
      title: en ? "About RETECH" : "Tentang RETECH",
      href: "/about",
      keywords: ["tentang", "about", "profil", "perusahaan"],
      text: en
        ? `${companyContact.legalName} is a B2B technology partner for digital product development, managed infrastructure and IT operations, and remote server deployment. Based in Bekasi, RETECH aligns implementation with business requirements, security and maintainability.`
        : `${companyContact.legalName} adalah partner teknologi B2B untuk pengembangan produk digital, pengelolaan infrastruktur/operasional IT, serta deployment server secara remote. Berbasis di Bekasi, RETECH menyesuaikan implementasi dengan kebutuhan bisnis, keamanan, dan kemudahan pemeliharaan.`,
    },
    {
      id: "product:attendance",
      title: "ReTendance / Attendance",
      href: "/products/attendance",
      keywords: [
        "attendance",
        "absen",
        "retendance",
        "karyawan",
        "employee",
        "wajah",
        "shift",
      ],
      text: en
        ? "ReTendance provides selfie and location-based attendance, face verification, overnight shifts, attendance history, leave approvals and a company dashboard. Free: up to 10 employees; Pro: IDR12,500/employee seat/month, 3 locations and 1 approval level; Business: IDR20,000/employee seat/month, 10 locations and up to 3 approval levels. Payments and renewals follow confirmed quotations/invoices; no automatic charge is initiated here. Face verification does not guarantee zero fraud. Android app is available on Google Play."
        : "ReTendance menyediakan absensi selfie dan lokasi, verifikasi wajah, shift lintas hari, riwayat kehadiran, persetujuan izin/cuti, dan dashboard perusahaan. Free: maksimal 10 karyawan; Pro: Rp12.500/slot karyawan/bulan, 3 lokasi dan 1 tingkat persetujuan; Bisnis: Rp20.000/slot karyawan/bulan, 10 lokasi dan hingga 3 tingkat persetujuan. Pembayaran/perpanjangan mengikuti quotation/invoice yang dikonfirmasi, bukan penagihan otomatis dari chat. Verifikasi wajah tidak menjamin bebas kecurangan. Aplikasi Android tersedia di Google Play.",
    },
    {
      id: "vps",
      title: "VPS RETECH",
      href: "/services/vps",
      keywords: [
        "vps",
        "rds",
        "lite",
        "pro",
        "cloud",
        "plesk",
        "cpanel",
        "sla",
        "backup",
      ],
      text: en
        ? "VPS configurations and resale prices are quotation-based. Plesk and cPanel licenses are optional; no panel is also available. Infrastructure SLA targets 99.9% monthly covered uptime with exclusions; 24/7 support and initial response are not a guaranteed resolution time. Additional disk, snapshots, scheduled/offsite backup and Manage Server require an agreed scope."
        : "Konfigurasi dan harga jual VPS melalui penawaran. Lisensi Plesk atau cPanel opsional; tersedia pilihan tanpa panel. SLA infrastruktur menargetkan uptime tercakup 99,9% per bulan dengan pengecualian; dukungan 24/7 dan waktu respons awal bukan jaminan waktu penyelesaian. Additional disk, snapshot, backup terjadwal/off-site, dan Manage Server perlu scope yang disepakati.",
    },
    {
      id: "contact",
      title: en ? "Contact RETECH" : "Kontak RETECH",
      href: "/#contact",
      keywords: [
        "kontak",
        "contact",
        "alamat",
        "kantor",
        "office",
        "whatsapp",
        "email",
        "retech",
      ],
      text: `${companyContact.legalName}. ${companyContact.address}. Email ${companyContact.email}; WhatsApp ${companyContact.whatsappDisplay} (chat only). ${en ? "Visits and consultations require team confirmation." : "Kunjungan dan konsultasi perlu konfirmasi tim."}`,
    },
    {
      id: "privacy",
      title: en ? "Privacy and account help" : "Privasi dan bantuan akun",
      href: "/privacy-policy",
      keywords: [
        "privacy",
        "privasi",
        "password",
        "hapus",
        "akun",
        "account",
        "invoice",
        "tagihan",
      ],
      text: en
        ? "RETECH Chat uses internal rules and official public information, not an external LLM. Name, email, phone and chat are stored only after explicit contact-form consent, for admin follow-up with 7-day retention. A signed essential session cookie lasts 30 minutes; a pending question may be held temporarily in the current browser tab. Administrators can delete chat and its contact profile. Never send passwords/tokens. The agent cannot access accounts, invoices, private servers or employee records. Attendance deletion/tutorial resources are linked from the product page."
        : "RETECH Chat menggunakan aturan internal dan informasi publik resmi, bukan LLM eksternal. Nama, email, telepon, dan chat disimpan setelah persetujuan eksplisit pada form kontak untuk tindak lanjut admin dengan retensi 7 hari. Cookie sesi esensial berlaku 30 menit; pertanyaan sementara dapat disimpan pada tab browser. Admin dapat menghapus chat beserta profil kontaknya. Jangan kirim password/token. Agent tidak dapat mengakses akun, invoice, server privat, atau data karyawan. Tautan penghapusan akun/tutorial Attendance tersedia di halaman produk.",
    },
    {
      id: "portfolio",
      title: "Case Studies RETECH",
      href: "/work",
      keywords: ["portfolio", "portofolio", "case", "project", "proyek"],
      text: en
        ? "Published case studies cover logistics websites, operational dashboards/CMS, attendance systems and infrastructure monitoring. Customer identities and sensitive visuals are anonymized."
        : "Case studies publik mencakup website logistik, dashboard operasional/CMS, attendance, dan monitoring infrastruktur. Identitas customer dan visual sensitif telah dianonimkan.",
    },
  );
  // Attendance uses its audited landing-page facts, not legacy CMS product/FAQ plans.
  for (const [i, faq] of faqs.slice(0, 40).entries())
    if (!/absen|attendance|retendance/i.test(faq.question + faq.answer))
      documents.push({
        id: `faq:${i}`,
        title: faq.question.slice(0, 150),
        href: "/faq",
        text: faq.answer.slice(0, 1000),
        keywords: [],
      });
  for (const record of pricing
    .filter((p) => !/\b(?:vps|rds)\b/i.test(p.data.name))
    .slice(0, 50))
    documents.push({
      id: `pricing:${record.slug}`,
      title: record.data.name.slice(0, 150),
      href: "/pricing",
      text: `${record.data.price}. ${record.data.description}. ${en ? "Published starting/catalog rate; final scope requires a quotation." : "Harga katalog/awal yang dipublikasikan; scope akhir perlu penawaran."}`.slice(
        0,
        1000,
      ),
      keywords: [
        "harga",
        "price",
        "pricing",
        "biaya",
        record.slug,
        record.section,
      ],
    });
  const catalog: CatalogItem[] = Object.entries(ATTENDANCE_PRICES).map(
    ([key, plan]) => ({
      product: "attendance",
      key,
      name:
        key === "free"
          ? "Free"
          : key === "pro"
            ? "Pro"
            : en
              ? "Business"
              : "Bisnis",
      unitPrice: plan.amount,
      maximum: "maximum" in plan ? plan.maximum : undefined,
      unit: key === "free" ? "company" : "employee",
      starting: false,
      source: { title: "ReTendance", href: "/products/attendance" },
    }),
  );
  for (const p of products.filter((p) => p.slug === "qr-order-pos"))
    for (const plan of p.plans.slice(0, 12))
      catalog.push({
        product: "qr-order-pos",
        key: plan.name.toLowerCase().replace(/ /g, "-"),
        name: plan.name.slice(0, 100),
        unitPrice: /multi|custom|hubungi|contact/i.test(plan.name + plan.price)
          ? null
          : parseCatalogPrice(plan.price),
        unit: "outlet",
        starting: /mulai|from/i.test(plan.price),
        source: {
          title: p.title.slice(0, 150),
          href: "/products/qr-order-pos",
        },
      });
  for (const record of pricing
    .filter((p) => p.section === "development")
    .slice(0, 30))
    catalog.push({
      product: "development",
      key: record.slug,
      name: record.data.name.slice(0, 100),
      unitPrice: parseCatalogPrice(record.data.price),
      unit: "project",
      starting: true,
      source: { title: "Pricing RETECH", href: "/pricing" },
    });
  return {
    documents: documents.filter((d) => /^\/[a-z0-9/#-]*$/.test(d.href)),
    catalog,
    loadedAt: new Date().toISOString(),
  };
}
