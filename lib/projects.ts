export type Project = {
  slug: string;
  title: string;
  category: string;
  status: "live" | "in-development";
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  services: string[];
  gallery: { src: string; alt: string }[];
  featured: boolean;
  sortOrder: number;
};

export const fallbackProjects: Project[] = [
  {
    slug: "logistics-company-website",
    title: "Logistics Company Website",
    category: "Digital Product",
    status: "live",
    summary:
      "Company profile responsif yang merapikan informasi layanan logistik dan memudahkan calon pelanggan menemukan jalur komunikasi yang tepat.",
    challenge:
      "Informasi layanan yang luas perlu disusun menjadi pengalaman digital yang mudah dipahami di desktop maupun perangkat mobile.",
    solution:
      "RETECH merancang arsitektur halaman, tampilan layanan, alur konversi, dan pengalaman responsif dari tahap eksplorasi sampai inquiry.",
    outcome:
      "Kehadiran digital yang lebih terstruktur, cepat diakses, dan siap mendukung kebutuhan pemasaran perusahaan.",
    services: ["Company Profile", "Responsive Web", "UX Structure", "Inquiry Flow"],
    gallery: [
      { src: "/case-studies/logistics/hero.png", alt: "Tampilan utama website perusahaan logistik" },
      { src: "/case-studies/logistics/services.png", alt: "Tampilan layanan website perusahaan logistik" },
    ],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "operations-dashboard-cms",
    title: "Operations Dashboard & CMS",
    category: "Business Application",
    status: "live",
    summary:
      "Dashboard operasional dan CMS terpusat untuk memantau aktivitas, mengelola konten, dan menyederhanakan pekerjaan administratif.",
    challenge:
      "Data operasional dan konten tersebar di beberapa alur kerja, sehingga pembaruan dan pemantauan membutuhkan lebih banyak waktu.",
    solution:
      "RETECH membangun dashboard ringkas, modul pengelolaan konten, pencarian, pagination, dan kontrol data dalam satu sistem.",
    outcome:
      "Tim dapat membaca kondisi operasional dan memperbarui konten dari satu area kerja yang konsisten.",
    services: ["Web App", "Dashboard", "CMS", "Role-based Admin"],
    gallery: [
      { src: "/case-studies/dashboard-cms/overview.png", alt: "Ringkasan metrik dashboard operasional" },
      { src: "/case-studies/dashboard-cms/content-management.png", alt: "Tampilan pengelolaan konten CMS" },
    ],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "hrms-attendance-platform",
    title: "HRMS & Attendance Platform",
    category: "Business Application",
    status: "live",
    summary:
      "Sistem HR terintegrasi untuk memantau absensi, keterlambatan, jadwal, cuti, dan laporan administratif dalam satu dashboard.",
    challenge:
      "Tim HR membutuhkan gambaran kehadiran yang cepat tanpa harus merekap data secara manual dari berbagai sumber.",
    solution:
      "RETECH menyatukan data absensi, filter periode, ringkasan visual, laporan, dan administrasi cuti dalam platform terpusat.",
    outcome:
      "Pemantauan kehadiran menjadi lebih ringkas dan keputusan administratif dapat dibuat dengan data yang lebih mudah dibaca.",
    services: ["HRMS", "Attendance", "Reporting", "Dashboard Analytics"],
    gallery: [
      { src: "/case-studies/hrms/attendance-analytics.png", alt: "Analitik absensi dan keterlambatan" },
      { src: "/case-studies/hrms/attendance-percentage.png", alt: "Ringkasan persentase kehadiran" },
    ],
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "infrastructure-monitoring",
    title: "Infrastructure Monitoring",
    category: "Managed IT",
    status: "live",
    summary:
      "Control center untuk memantau traffic, utilisasi link, kesehatan router, dan tren bandwidth secara real-time.",
    challenge:
      "Kondisi jaringan harus terlihat secara cepat agar gangguan dan beban berlebih dapat ditangani sebelum berdampak luas.",
    solution:
      "RETECH membangun dashboard monitoring dengan indikator kapasitas, status kesehatan, grafik real-time, dan threshold operasional.",
    outcome:
      "Tim IT memperoleh visibilitas terpusat untuk menjaga stabilitas layanan dan merespons anomali lebih awal.",
    services: ["Network Monitoring", "Server Monitoring", "Alerting", "Managed IT"],
    gallery: [
      { src: "/case-studies/infrastructure-monitoring/realtime-overview.png", alt: "Ringkasan monitoring jaringan real-time" },
      { src: "/case-studies/infrastructure-monitoring/bandwidth-trend.png", alt: "Grafik tren bandwidth real-time" },
    ],
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "android-attendance-app",
    title: "Android Attendance App",
    category: "Mobile Application",
    status: "in-development",
    summary:
      "Aplikasi Android untuk absensi lapangan yang direncanakan terhubung langsung dengan HRMS dan alur verifikasi perusahaan.",
    challenge:
      "Proses absensi mobile membutuhkan pengalaman yang sederhana, validasi yang jelas, dan sinkronisasi data yang aman.",
    solution:
      "Tahap pengembangan berikutnya berfokus pada alur check-in, validasi lokasi, bukti kehadiran, dan sinkronisasi ke HRMS.",
    outcome:
      "Targetnya adalah pengalaman absensi mobile yang cepat untuk karyawan dan tetap mudah diawasi oleh tim HR.",
    services: ["Android", "Mobile UX", "API Integration", "HRMS Sync"],
    gallery: [],
    featured: false,
    sortOrder: 5,
  },
];

function normalizeProject(row: Record<string, unknown>): Project | null {
  if (typeof row.slug !== "string" || typeof row.title !== "string") return null;
  const gallery = Array.isArray(row.gallery)
    ? row.gallery.filter(
        (item): item is { src: string; alt: string } =>
          typeof item === "object" && item !== null &&
          typeof (item as { src?: unknown }).src === "string" &&
          typeof (item as { alt?: unknown }).alt === "string",
      )
    : [];

  return {
    slug: row.slug,
    title: row.title,
    category: typeof row.category === "string" ? row.category : "Digital Solution",
    status: row.status === "in-development" ? "in-development" : "live",
    summary: typeof row.summary === "string" ? row.summary : "",
    challenge: typeof row.challenge === "string" ? row.challenge : "",
    solution: typeof row.solution === "string" ? row.solution : "",
    outcome: typeof row.outcome === "string" ? row.outcome : "",
    services: Array.isArray(row.services) ? row.services.filter((item): item is string => typeof item === "string") : [],
    gallery,
    featured: row.featured === true,
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 99,
  };
}

export async function getProjects(): Promise<Project[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return fallbackProjects;

  try {
    const response = await fetch(
      `${url}/rest/v1/portfolio_projects?select=*&published=eq.true&order=sort_order.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      },
    );
    if (!response.ok) return fallbackProjects;
    const rows = (await response.json()) as Record<string, unknown>[];
    const projects = rows.map(normalizeProject).filter((item): item is Project => item !== null);
    return projects.length ? projects : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

export async function getProject(slug: string) {
  return (await getProjects()).find((project) => project.slug === slug);
}
