export type ServiceDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  includes: string[];
  outcomes: string[];
  process: Array<{ title: string; description: string }>;
  bestFor: string[];
  relatedWork: Array<{ label: string; href: string }>;
};

import type { Locale } from "./i18n";

export const services: ServiceDefinition[] = [
  {
    slug: "digital-product-development",
    eyebrow: "BUILD",
    title: "Digital Product & Application Development",
    shortTitle: "Product Development",
    summary: "Website, CMS, web application, serta aplikasi Android dan iOS yang dibangun mengikuti kebutuhan operasional bisnis.",
    description:
      "RETECH membantu dari discovery, perancangan UI, pengembangan frontend dan backend, integrasi API, testing, sampai deployment dan handover.",
    includes: [
      "Landing page dan company profile",
      "Website dengan CMS atau dashboard admin",
      "Web application dan business workflow",
      "Android application",
      "Android + iOS application",
      "Backend, database, dan API integration",
    ],
    outcomes: ["Produk digital sesuai brand", "Alur kerja lebih efisien", "Sistem siap dikembangkan bertahap"],
    process: [
      { title: "Discovery", description: "Memetakan tujuan, pengguna, fitur utama, integrasi, dan batas ruang lingkup." },
      { title: "Design & Build", description: "Mendesain pengalaman pengguna lalu mengembangkan solusi secara iteratif." },
      { title: "Test & Launch", description: "Menguji alur penting, menyiapkan deployment, dokumentasi, dan handover." },
    ],
    bestFor: ["Perusahaan yang membutuhkan website profesional", "Tim yang ingin mengganti proses manual", "Bisnis yang membutuhkan aplikasi custom"],
    relatedWork: [
      { label: "Logistics Company Website", href: "/work/logistics-company-website" },
      { label: "Operations Dashboard & CMS", href: "/work/operations-dashboard-cms" },
      { label: "Android Attendance App", href: "/work/android-attendance-app" },
    ],
  },
  {
    slug: "managed-it-services",
    eyebrow: "OPERATE",
    title: "Managed Infrastructure & IT Operations",
    shortTitle: "Managed IT Services",
    summary: "Pemeliharaan, monitoring, helpdesk, backup, dan dukungan infrastruktur untuk menjaga layanan bisnis tetap stabil.",
    description:
      "Kami membantu memantau kondisi sistem, menjalankan pekerjaan rutin, merespons gangguan, dan menyusun tindakan perbaikan sesuai prioritas risiko.",
    includes: [
      "Server maintenance dan patch terjadwal",
      "Monitoring server, endpoint, dan sertifikat",
      "Monitoring jaringan dan kapasitas",
      "Helpdesk dan incident support",
      "Backup verification serta restore support",
      "Health report dan rekomendasi teknis",
    ],
    outcomes: ["Visibilitas kondisi infrastruktur", "Risiko downtime lebih terkendali", "Pekerjaan rutin terdokumentasi"],
    process: [
      { title: "Baseline", description: "Mencatat aset, service, dependensi, akses, risiko, dan kondisi awal sistem." },
      { title: "Monitor & Maintain", description: "Menjalankan pemeriksaan rutin, monitoring, patch, dan validasi backup." },
      { title: "Report & Improve", description: "Menyampaikan temuan, insiden, tren kapasitas, dan rencana peningkatan." },
    ],
    bestFor: ["Bisnis tanpa tim infrastruktur penuh", "Sistem yang harus dipantau rutin", "Perusahaan yang membutuhkan support terukur"],
    relatedWork: [{ label: "Infrastructure Monitoring", href: "/work/infrastructure-monitoring" }],
  },
  {
    slug: "remote-server-support",
    eyebrow: "DEPLOY",
    title: "Remote IT & Server Deployment",
    shortTitle: "Remote & Server Support",
    summary: "Instalasi, konfigurasi, troubleshooting, migrasi, dan hardening server yang dapat dikerjakan secara remote.",
    description:
      "RETECH menangani kebutuhan teknis berbasis scope: dari satu insiden, deployment service baru, sampai migrasi workload dan penguatan konfigurasi server.",
    includes: [
      "Remote troubleshooting",
      "Linux server installation",
      "Web stack dan database configuration",
      "Mail server dan SMTP relay setup",
      "Migration dan deployment support",
      "Server hardening dan access review",
    ],
    outcomes: ["Masalah teknis ditangani terarah", "Konfigurasi lebih konsisten", "Deployment disertai catatan pekerjaan"],
    process: [
      { title: "Triage", description: "Memeriksa gejala, akses, dampak, batas pekerjaan, dan rencana pengamanan." },
      { title: "Execute", description: "Menjalankan perubahan secara bertahap dengan verifikasi di setiap titik penting." },
      { title: "Verify & Handover", description: "Menguji hasil, mencatat konfigurasi, risiko tersisa, dan langkah lanjutan." },
    ],
    bestFor: ["Insiden yang membutuhkan engineer remote", "Deployment server baru", "Migrasi atau hardening sistem berjalan"],
    relatedWork: [{ label: "Infrastructure Monitoring", href: "/work/infrastructure-monitoring" }],
  },
];

export const englishServices: Record<string, Omit<ServiceDefinition, "slug">> = {
  "digital-product-development": {
    eyebrow: "BUILD",
    title: "Digital Product & Application Development",
    shortTitle: "Product Development",
    summary: "Websites, CMS platforms, web applications, and Android and iOS apps built around real business operations.",
    description: "RETECH supports the full journey from discovery and UI design to frontend and backend development, API integration, testing, deployment, and handover.",
    includes: ["Landing pages and company profiles", "Websites with a CMS or admin dashboard", "Web applications and business workflows", "Android applications", "Android + iOS applications", "Backend, database, and API integration"],
    outcomes: ["Digital products aligned with your brand", "More efficient workflows", "A system ready for phased growth"],
    process: [
      { title: "Discovery", description: "Map the goals, users, key features, integrations, and scope boundaries." },
      { title: "Design & Build", description: "Design the user experience and develop the solution iteratively." },
      { title: "Test & Launch", description: "Test critical flows and prepare deployment, documentation, and handover." },
    ],
    bestFor: ["Companies that need a professional website", "Teams replacing manual processes", "Businesses that need a custom application"],
    relatedWork: [
      { label: "Logistics Company Website", href: "/work/logistics-company-website" },
      { label: "Operations Dashboard & CMS", href: "/work/operations-dashboard-cms" },
      { label: "Android Attendance App", href: "/work/android-attendance-app" },
    ],
  },
  "managed-it-services": {
    eyebrow: "OPERATE",
    title: "Managed Infrastructure & IT Operations",
    shortTitle: "Managed IT Services",
    summary: "Maintenance, monitoring, helpdesk, backup, and infrastructure support that keep business services stable.",
    description: "We help monitor system health, perform recurring tasks, respond to incidents, and plan improvements based on risk priorities.",
    includes: ["Server maintenance and scheduled patching", "Server, endpoint, and certificate monitoring", "Network and capacity monitoring", "Helpdesk and incident support", "Backup verification and restore support", "Health reports and technical recommendations"],
    outcomes: ["Clear infrastructure visibility", "Better-controlled downtime risk", "Documented recurring operations"],
    process: [
      { title: "Baseline", description: "Document assets, services, dependencies, access, risks, and the initial condition." },
      { title: "Monitor & Maintain", description: "Run routine checks, monitoring, patching, and backup validation." },
      { title: "Report & Improve", description: "Report findings, incidents, capacity trends, and improvement plans." },
    ],
    bestFor: ["Businesses without a full infrastructure team", "Systems that require continuous monitoring", "Companies that need measurable support"],
    relatedWork: [{ label: "Infrastructure Monitoring", href: "/work/infrastructure-monitoring" }],
  },
  "remote-server-support": {
    eyebrow: "DEPLOY",
    title: "Remote IT & Server Deployment",
    shortTitle: "Remote & Server Support",
    summary: "Remote installation, configuration, troubleshooting, migration, and server hardening delivered against a clear scope.",
    description: "RETECH handles scoped technical needs, from a single incident and a new service deployment to workload migration and server configuration hardening.",
    includes: ["Remote troubleshooting", "Linux server installation", "Web stack and database configuration", "Mail server and SMTP relay setup", "Migration and deployment support", "Server hardening and access review"],
    outcomes: ["Structured technical resolution", "More consistent configurations", "Deployment accompanied by work notes"],
    process: [
      { title: "Triage", description: "Review symptoms, access, impact, scope boundaries, and safeguards." },
      { title: "Execute", description: "Apply changes in controlled stages with verification at key checkpoints." },
      { title: "Verify & Handover", description: "Test the outcome and document configurations, residual risks, and next steps." },
    ],
    bestFor: ["Incidents requiring a remote engineer", "New server deployments", "Migration or hardening of a running system"],
    relatedWork: [{ label: "Infrastructure Monitoring", href: "/work/infrastructure-monitoring" }],
  },
};

export function getFallbackServices(locale: Locale): ServiceDefinition[] {
  if (locale === "id") return services;
  return services.map((service) => ({ slug: service.slug, ...englishServices[service.slug] }));
}

export function getFallbackService(slug: string, locale: Locale = "id") {
  return getFallbackServices(locale).find((service) => service.slug === slug);
}
