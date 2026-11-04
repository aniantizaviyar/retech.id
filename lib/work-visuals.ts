import type { Locale } from "./i18n";
import type { Project } from "./projects";

// Approved UI reconstructions. Apply only in /work; do not mutate the shared
// project catalog used by the homepage and individual case-study pages.
export const workVisuals: Readonly<Record<string, { src: string; alt: Record<Locale, string> }>> = {
  "logistics-company-website": {
    src: "/privacy-safe/work-20261104/website-landing.webp",
    alt: { id: "Rekonstruksi UI website logistik dengan pelacakan kiriman dan data demo", en: "Reconstructed logistics website UI with shipment tracking and demo data" },
  },
  "operations-dashboard-cms": {
    src: "/privacy-safe/work-20261104/dashboard-crm.webp",
    alt: { id: "Rekonstruksi UI dashboard CRM dengan daftar prospek dan tindak lanjut fiktif", en: "Reconstructed CRM dashboard UI with fictional prospects and follow-up records" },
  },
  "hrms-attendance-platform": {
    src: "/privacy-safe/work-20261104/attendance-platform.webp",
    alt: { id: "Rekonstruksi UI dashboard attendance dengan kehadiran dan jadwal dari data dummy", en: "Reconstructed attendance dashboard UI with synthetic attendance and schedule data" },
  },
  "infrastructure-monitoring": {
    src: "/privacy-safe/work-20261104/infrastructure-monitoring.webp",
    alt: { id: "Rekonstruksi UI monitoring infrastruktur dengan grafik CPU dan respons HTTP simulasi", en: "Reconstructed infrastructure monitoring UI with simulated CPU and HTTP-response charts" },
  },
  "android-attendance-app": {
    src: "/privacy-safe/work-20261104/android-attendance.webp",
    alt: { id: "Rekonstruksi dua layar Android attendance untuk check-in dan riwayat dengan data demo", en: "Reconstructed Android attendance check-in and history screens with demo data" },
  },
};

export function withWorkVisuals(projects: Project[], locale: Locale): Project[] {
  return projects.map((project) => {
    const visual = Object.hasOwn(workVisuals, project.slug) ? workVisuals[project.slug] : undefined;
    return visual
      ? { ...project, gallery: [{ src: visual.src, alt: visual.alt[locale] }, ...project.gallery.slice(1)] }
      : project;
  });
}
