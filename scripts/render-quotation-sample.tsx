import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPdf } from "../lib/quotation-pdf";
import type { Quotation } from "../lib/quotations";

const quotation: Quotation = {
  id: "sample",
  quote_number: "RTD/QTN/2026/0001",
  status: "draft",
  issue_date: "2026-08-24",
  valid_until: "2026-09-07",
  customer_company: "PT CONTOH NUSANTARA",
  customer_name: "Bapak/Ibu Procurement",
  customer_email: "procurement@example.com",
  customer_phone: "+62 812-0000-0000",
  customer_address: "Jakarta, Indonesia",
  subject: "Pengembangan Website Company Profile dan Managed Hosting",
  items: [
    { name: "Website Company Profile", description: "UI sesuai brand, hingga 7 halaman, responsive, bilingual, form inquiry, basic SEO, analytics, dan deployment produksi.", quantity: 1, unit: "paket", unitPrice: 7_500_000 },
    { name: "CMS Content Management", description: "Dashboard administrator untuk mengelola halaman, layanan, FAQ, pricing, media, dan case studies.", quantity: 1, unit: "paket", unitPrice: 5_500_000 },
    { name: "Managed Hosting", description: "Setup domain dan DNS, SSL, monitoring dasar, backup konfigurasi, dan dukungan operasional selama 12 bulan.", quantity: 1, unit: "tahun", unitPrice: 2_400_000 },
  ],
  discount_amount: 900_000,
  timeline: "Estimasi 5-7 minggu setelah pembayaran awal serta materi dan feedback customer tersedia.",
  payment_terms: "50% pembayaran awal, 30% setelah UAT, dan 20% sebelum handover produksi.",
  scope_included: ["Discovery dan pemetaan kebutuhan", "Desain UI responsive dan implementasi", "Testing, deployment, dokumentasi, dan handover", "Garansi bug selama 60 hari setelah go-live"],
  scope_excluded: ["Biaya domain, lisensi pihak ketiga, dan akun marketplace", "Penulisan konten, foto profesional, dan terjemahan tersertifikasi", "Perubahan fitur di luar scope yang disetujui"],
  notes: "Quotation berlaku selama 14 hari. Pekerjaan dimulai setelah persetujuan tertulis dan pembayaran awal diterima. Dua putaran revisi mayor termasuk pada fase desain. Permintaan tambahan akan dibuatkan estimasi terpisah.",
};

const [logo, signature, stamp] = await Promise.all([
  readFile(path.join(process.cwd(), "public", "retech-logo-transparent.png")),
  readFile(path.join(process.cwd(), "public", "documents", "retech-signature.png")),
  readFile(path.join(process.cwd(), "public", "documents", "retech-stamp-transparent.png")),
]);
const pdf = await renderToBuffer(<QuotationPdf quotation={quotation} logoSrc={`data:image/png;base64,${logo.toString("base64")}`} signatureSrc={`data:image/png;base64,${signature.toString("base64")}`} stampSrc={`data:image/png;base64,${stamp.toString("base64")}`} />);
const outputDirectory = path.join(process.cwd(), "output", "pdf");
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, "retech-quotation-template.pdf");
await writeFile(output, pdf);
process.stdout.write(output);
