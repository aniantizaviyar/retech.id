import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPdf } from "../lib/quotation-pdf";
import type { Quotation } from "../lib/quotations";

// This regression fixture never reads a production record.
const sample: Quotation = {
  id: "layout-test", quote_number: "RTD/QTN/2026/0000", status: "draft", issue_date: "2026-11-16", valid_until: "2026-12-16",
  customer_company: "PT Contoh Nusantara", customer_name: "PIC Contoh", customer_email: "pic@example.com", customer_phone: "080000000000",
  customer_cc: ["finance@example.com"], customer_address: "Gedung Contoh, Jalan Contoh Nomor 100, Kecamatan Contoh, Kota Contoh, Indonesia 00000",
  subject: "Jasa Implementasi Backup NAS Lokal, Integrasi VPS, dan Aplikasi Web Privat",
  items: [
    ["Survei kebutuhan dan rancangan teknis", "Pemeriksaan perangkat, koneksi, dan data yang perlu dicadangkan. Rencana kapasitas, jadwal, masa simpan, dan pemulihan.", 5_000_000],
    ["Infrastruktur, pengamanan, dan otomasi backup", "Satu server backup lokal dengan koneksi privat ke satu VPS. Backup otomatis dan manual dengan pemeriksaan hasil salinan dan notifikasi jika gagal.", 16_000_000],
    ["Pengembangan dan integrasi aplikasi web privat", "Portal untuk tim yang berwenang agar dapat menjalankan backup, mengecek kapasitas dan riwayat, menelusuri versi file, serta mengunduh hasil pemulihan.", 25_000_000],
    ["Pengujian integrasi, keamanan dasar, dan pemulihan", "Uji pemulihan data untuk memastikan salinan sama dengan aslinya, termasuk pengecekan hak akses dan notifikasi kegagalan.", 11_000_000],
    ["Pemasangan, uji penerimaan, dokumentasi, dan pelatihan", "Uji backup awal dan pemulihan bersama tim klien. Serah terima kode, panduan, hasil uji, dan satu sesi pelatihan operator.", 8_000_000],
  ].map(([name, description, unitPrice]) => ({ name: String(name), description: String(description), unitPrice: Number(unitPrice), quantity: 1, unit: "paket" })),
  discount_amount: 0,
  timeline: "5–7 minggu setelah penawaran disetujui, pembayaran awal diterima, serta perangkat, akses, dan PIC klien siap. Lama penyalinan data pertama bergantung pada ukuran data dan kecepatan koneksi.",
  payment_terms: "30% (Rp19.500.000) saat penawaran disetujui dan pekerjaan dimulai.\n40% (Rp26.000.000) setelah klien menerima hasil demo backup dan pemulihan di lingkungan uji.\n30% (Rp19.500.000) saat berita acara serah terima (BAST) ditandatangani.",
  scope_included: ["Pemasangan sistem Backup NAS, integrasi dengan satu VPS, dan pembuatan web privat sesuai lima item penawaran.", "Uji pemulihan data, dokumentasi, pelatihan operator, dan serah terima sesuai SOW."],
  scope_excluded: ["Pengadaan perangkat, lisensi, sewa VPS, dan biaya penyimpanan di luar lokasi.", "Kunjungan teknisi, pemeliharaan rutin, dukungan 24/7, dan audit keamanan independen.", "Penyediaan lokasi cadangan tambahan dan uji pemulihan dari lokasi tersebut."],
  notes: "Penawaran berlaku 30 hari kalender sejak diterbitkan. Perbaikan kendala dalam lingkup penawaran berlaku selama 30 hari setelah BAST. Biaya dan jadwal pekerjaan tambahan disepakati secara tertulis.",
};

const [logo, signature, stamp] = await Promise.all(["public/retech-logo-transparent.png", "public/documents/retech-signature.png", "public/documents/retech-stamp-transparent.png"].map(async path => `data:image/png;base64,${(await readFile(path)).toString("base64")}`));
const output = process.argv[2] || "tmp/pdfs/quotation-layout";
await mkdir(output, { recursive: true });
const cases = {
  "nas-example": sample,
  compact: { ...sample, items: sample.items.slice(0, 1), payment_terms: "Dibayar saat pekerjaan selesai.", timeline: "" },
  "multiple-pages": {
    ...sample,
    items: [...sample.items, ...sample.items, ...sample.items, ...sample.items],
    timeline: sample.timeline.repeat(2).slice(0, 500),
    payment_terms: `${sample.payment_terms}\n${"Tahapan tambahan ditinjau bersama klien sebelum konfirmasi pembayaran. ".repeat(10)}Termin terakhir diverifikasi.`,
  },
};
for (const [name, quotation] of Object.entries(cases)) {
  const pdf = await renderToBuffer(<QuotationPdf quotation={quotation} logoSrc={logo} signatureSrc={signature} stampSrc={stamp} />);
  await writeFile(join(output, `${name}.pdf`), pdf);
}
