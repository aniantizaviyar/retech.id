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

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
