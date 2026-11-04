import type { Locale } from "./i18n";
import type { Project } from "./projects";

// Approved UI reconstructions, shared by every public project surface.
// CMS text and other business metadata remain untouched.
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

export const productVisuals = {
  attendance: {
    src: workVisuals["android-attendance-app"].src,
    alt: workVisuals["android-attendance-app"].alt,
  },
  "qr-order-pos": {
    src: "/privacy-safe/work-20261104/qr-order-pos.webp",
    alt: {
      id: "Rekonstruksi UI QR Order dan POS dengan pesanan serta menu cafe dari data demo",
      en: "Reconstructed QR Order and POS UI with demo cafe menu and orders",
    },
  },
} as const;

export function withProductVisuals<T extends { slug: string; heroImage: string; heroAlt: string }>(products: T[], locale: Locale): T[] {
  return products.map((product) => {
    const visual = Object.hasOwn(productVisuals, product.slug)
      ? productVisuals[product.slug as keyof typeof productVisuals]
      : undefined;
    return visual ? { ...product, heroImage: visual.src, heroAlt: visual.alt[locale] } : product;
  });
}
