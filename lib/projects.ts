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

import type { Locale } from "./i18n";

export const fallbackProjects: Project[] = [
  {
    slug: "logistics-company-website",
    title: "Logistics Company Website",
    category: "Digital Product",
    status: "live",
    summary:
      "Platform logistik responsif dengan pelacakan kiriman, pengecekan tarif, serta CMS operasional untuk mengelola shipment, konten, dan pesan customer.",
    challenge:
      "Informasi layanan, status pengiriman, dan estimasi tarif perlu disusun menjadi pengalaman yang mudah dipahami di desktop maupun perangkat mobile.",
    solution:
      "RETECH merancang company profile, pencarian nomor resi, pengecekan tarif, dan dashboard CMS untuk memantau shipment serta mengelola konten dan inquiry.",
    outcome:
      "Pelanggan dapat mengenali layanan, melacak kiriman, dan mengecek tarif lebih cepat dari satu kanal digital yang terstruktur.",
    services: ["Shipment Tracking", "Rate Checker", "Operations CMS", "Responsive Web"],
    gallery: [
      { src: "/case-studies/logistics/tracking-and-rate-v2.png", alt: "Website pelacakan kiriman dan pengecekan tarif" },
      { src: "/case-studies/logistics/cms-dashboard.png", alt: "Dashboard CMS untuk shipment, konten, dan pesan customer" },
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
      "RETECH membangun dashboard ringkas, modul pengelolaan konten, pencarian, pagination, kontrol data, analitik submission, dan administrasi campaign dalam satu sistem.",
    outcome:
      "Tim dapat membaca kondisi operasional dan memperbarui konten dari satu area kerja yang konsisten.",
    services: ["Web App", "Dashboard", "CMS", "Campaign Administration", "Role-based Admin"],
    gallery: [
      { src: "/case-studies/dashboard-cms/news-cms.png", alt: "Pengelolaan artikel dan alur publikasi News CMS" },
      { src: "/case-studies/dashboard-cms/analytics-dashboard.png", alt: "Dashboard analytics untuk metrik penggunaan dan pertumbuhan" },
      { src: "/case-studies/dashboard-cms/shipment-cms.png", alt: "Pengelolaan shipment dan pembaruan status operasional" },
      { src: "/case-studies/dashboard-cms/contest-login-privacy.webp", alt: "Login aman untuk dashboard administrasi campaign" },
      { src: "/case-studies/dashboard-cms/contest-dashboard-privacy.webp", alt: "Dashboard campaign dengan ringkasan submission dan distribusi tema" },
      { src: "/case-studies/dashboard-cms/contest-submissions-privacy.webp", alt: "Pengelolaan dan pemeriksaan detail submission pada CMS" },
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
      "RETECH menyatukan dashboard kehadiran, analitik keterlambatan, filter periode, approval cuti, pengelolaan sisa cuti, dan administrasi pengguna dalam platform terpusat.",
    outcome:
      "Pemantauan kehadiran menjadi lebih ringkas dan keputusan administratif dapat dibuat dengan data yang lebih mudah dibaca.",
    services: ["HRMS", "Attendance", "Leave Approval", "Leave Balance", "Reporting", "Dashboard Analytics"],
    gallery: [
      { src: "/case-studies/hrms/login-privacy.webp", alt: "Halaman login aman untuk portal administrasi HRMS" },
      { src: "/case-studies/hrms/dashboard-overview-privacy.webp", alt: "Dashboard HRMS dengan tren absensi dan status check-in" },
      { src: "/case-studies/hrms/attendance-analysis-privacy.webp", alt: "Analitik keterlambatan, shift, dan komposisi check-in" },
      { src: "/case-studies/hrms/leave-approval-privacy.webp", alt: "Administrasi approval dan status pengajuan cuti" },
      { src: "/case-studies/hrms/leave-balances-privacy.webp", alt: "Pengelolaan kuota, pemakaian, dan sisa cuti karyawan" },
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
      "Control center untuk memantau traffic, utilisasi link, kesehatan router, server, endpoint, layanan, dan sertifikat secara real-time.",
    challenge:
      "Kondisi jaringan harus terlihat secara cepat agar gangguan dan beban berlebih dapat ditangani sebelum berdampak luas.",
    solution:
      "RETECH membangun dashboard monitoring jaringan dan server dengan indikator kapasitas, endpoint availability, response time, service health, sertifikat TLS, grafik real-time, dan threshold operasional.",
    outcome:
      "Tim IT memperoleh visibilitas terpusat untuk menjaga stabilitas layanan dan merespons anomali lebih awal.",
    services: ["Network Monitoring", "Server Monitoring", "Alerting", "Managed IT"],
    gallery: [
      { src: "/case-studies/infrastructure-monitoring/network-monitor-v2.png", alt: "Dashboard monitoring jaringan, utilisasi link, dan bandwidth real-time" },
      { src: "/case-studies/infrastructure-monitoring/server-monitor-v2.png", alt: "Dashboard utilisasi resource, runtime, dan layanan server" },
      { src: "/case-studies/infrastructure-monitoring/server-monitoring.png", alt: "Monitoring kesehatan server, endpoint, layanan, dan sertifikat" },
    ],
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "android-attendance-app",
    title: "Android Attendance App",
    category: "Mobile Application",
    status: "live",
    summary:
      "Aplikasi Android untuk absensi foto berbasis lokasi dengan timestamp, riwayat kehadiran, serta deteksi indikasi fake dan mock location.",
    challenge:
      "Absensi mobile harus mudah digunakan sekaligus memastikan foto, lokasi, dan waktu kehadiran dapat divalidasi serta tidak mudah dimanipulasi.",
    solution:
      "RETECH membangun alur check-in dan check-out dengan bukti foto, validasi lokasi, timestamp audit, deteksi fake GPS dan mock location, kalender serta riwayat absensi, pengajuan cuti, Admin Hub, dan sinkronisasi HRMS.",
    outcome:
      "Tim HR memperoleh data absensi dan administrasi cuti yang lebih mudah diaudit, sementara karyawan dapat mengelola kehadiran langsung dari perangkat Android.",
    services: ["Photo Attendance", "Location Validation", "Anti Fake/Mock Location", "Attendance Calendar", "Leave Management", "Admin Hub", "HRMS Sync"],
    gallery: [
      { src: "/case-studies/android-attendance/mobile-dashboard-privacy.webp", alt: "Beranda aplikasi Android dengan check-in, check-out, lokasi, dan timestamp" },
      { src: "/case-studies/android-attendance/mobile-overview-privacy.webp", alt: "Ringkasan kehadiran dan akses cepat pada aplikasi Android" },
      { src: "/case-studies/android-attendance/attendance-calendar.jpg", alt: "Kalender absensi dengan ringkasan hadir, terlambat, dan shift" },
      { src: "/case-studies/android-attendance/admin-hub.jpg", alt: "Admin Hub untuk attendance, kedisiplinan, approval cuti, dan manajemen kuota" },
      { src: "/case-studies/android-attendance/leave-request.jpg", alt: "Pengajuan cuti, sisa kuota, dan riwayat status persetujuan" },
    ],
    featured: false,
    sortOrder: 5,
  },
];

type ProjectTranslation = Pick<Project, "title" | "category" | "summary" | "challenge" | "solution" | "outcome" | "services"> & { galleryAlt: string[] };

const englishProjectContent: Record<string, ProjectTranslation> = {
  "logistics-company-website": {
    title: "Logistics Company Website",
    category: "Digital Product",
    summary: "A responsive logistics platform with shipment tracking, rate checking, and an operational CMS for managing shipments, content, and customer messages.",
    challenge: "Service information, shipment status, and rate estimates needed to become a clear experience across desktop and mobile devices.",
    solution: "RETECH designed the company profile, tracking-number search, rate checker, and CMS dashboard for monitoring shipments and managing content and inquiries.",
    outcome: "Customers can understand services, track shipments, and check rates faster through one structured digital channel.",
    services: ["Shipment Tracking", "Rate Checker", "Operations CMS", "Responsive Web"],
    galleryAlt: ["Shipment tracking and rate-checking website", "CMS dashboard for shipments, content, and customer messages"],
  },
  "operations-dashboard-cms": {
    title: "Operations Dashboard & CMS",
    category: "Business Application",
    summary: "A centralized operational dashboard and CMS for monitoring activity, managing content, and simplifying administrative work.",
    challenge: "Operational data and content were spread across multiple workflows, making updates and monitoring more time-consuming.",
    solution: "RETECH built a concise dashboard, content management modules, search, pagination, data controls, submission analytics, and campaign administration in one system.",
    outcome: "The team can understand operational conditions and update content from one consistent workspace.",
    services: ["Web App", "Dashboard", "CMS", "Campaign Administration", "Role-based Admin"],
    galleryAlt: ["News CMS article management and publishing workflow", "Analytics dashboard for usage and growth metrics", "Shipment management and operational status updates", "Secure login for the campaign administration dashboard", "Campaign dashboard with submission and theme distribution summaries", "CMS submission management and detail review"],
  },
  "hrms-attendance-platform": {
    title: "HRMS & Attendance Platform",
    category: "Business Application",
    summary: "An integrated HR system for monitoring attendance, lateness, schedules, leave, and administrative reports in one dashboard.",
    challenge: "The HR team needed a fast view of attendance without manually consolidating data from multiple sources.",
    solution: "RETECH combined attendance dashboards, lateness analytics, period filters, leave approval, leave-balance management, and user administration in a centralized platform.",
    outcome: "Attendance monitoring is more concise and administrative decisions can be made with easier-to-read data.",
    services: ["HRMS", "Attendance", "Leave Approval", "Leave Balance", "Reporting", "Dashboard Analytics"],
    galleryAlt: ["Secure login page for the HRMS administration portal", "HRMS dashboard with attendance trends and check-in status", "Lateness, shift, and check-in composition analytics", "Leave request approval and status administration", "Employee leave quota, usage, and balance management"],
  },
  "infrastructure-monitoring": {
    title: "Infrastructure Monitoring",
    category: "Managed IT",
    summary: "A control center for real-time monitoring of traffic, link utilization, router health, servers, endpoints, services, and certificates.",
    challenge: "Network conditions needed to be visible quickly so incidents and excessive load could be addressed before they caused wider impact.",
    solution: "RETECH built network and server monitoring dashboards with capacity indicators, endpoint availability, response time, service health, TLS certificates, real-time charts, and operational thresholds.",
    outcome: "The IT team gains centralized visibility to maintain service stability and respond to anomalies earlier.",
    services: ["Network Monitoring", "Server Monitoring", "Alerting", "Managed IT"],
    galleryAlt: ["Real-time network, link utilization, and bandwidth monitoring dashboard", "Server resource, runtime, and service monitoring dashboard", "Server, endpoint, service, and certificate health monitoring"],
  },
  "android-attendance-app": {
    title: "Android Attendance App",
    category: "Mobile Application",
    summary: "An Android application for photo and location-based attendance with timestamps, attendance history, and fake or mock location detection.",
    challenge: "Mobile attendance needed to remain easy to use while ensuring photos, location, and attendance time could be validated and were harder to manipulate.",
    solution: "RETECH built check-in and check-out flows with photo evidence, location validation, audit timestamps, fake GPS and mock-location detection, an attendance calendar and history, leave requests, an Admin Hub, and HRMS synchronization.",
    outcome: "HR teams receive attendance and leave data that is easier to audit, while employees manage attendance directly from Android devices.",
    services: ["Photo Attendance", "Location Validation", "Anti Fake/Mock Location", "Attendance Calendar", "Leave Management", "Admin Hub", "HRMS Sync"],
    galleryAlt: ["Android app home screen with check-in, check-out, location, and timestamp", "Attendance summary and quick access in the Android app", "Attendance calendar with present, late, and shift summaries", "Admin Hub for attendance, discipline, leave approval, and quota management", "Leave request, remaining quota, and approval-status history"],
  },
};

function localizeProject(project: Project, locale: Locale): Project {
  if (locale === "id") return project;
  const translation = englishProjectContent[project.slug];
  if (!translation) return project;
  return {
    ...project,
    ...translation,
    gallery: project.gallery.map((image, index) => ({ ...image, alt: translation.galleryAlt[index] || image.alt })),
  };
}

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

export async function getProjects(locale: Locale = "id"): Promise<Project[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return fallbackProjects.map((project) => localizeProject(project, locale));

  try {
    const response = await fetch(
      `${url}/rest/v1/portfolio_projects?select=*&published=eq.true&order=sort_order.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      },
    );
    if (!response.ok) return fallbackProjects.map((project) => localizeProject(project, locale));
    const rows = (await response.json()) as Record<string, unknown>[];
    const projects = rows.map(normalizeProject).filter((item): item is Project => item !== null);
    return (projects.length ? projects : fallbackProjects).map((project) => localizeProject(project, locale));
  } catch {
    return fallbackProjects.map((project) => localizeProject(project, locale));
  }
}

export async function getProject(slug: string, locale: Locale = "id") {
  return (await getProjects(locale)).find((project) => project.slug === slug);
}
