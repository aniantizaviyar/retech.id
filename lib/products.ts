import type { Locale } from "./i18n";

export type ProductPlan = {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export type ProductFeature = { title: string; copy: string };

export type ProductDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  audiences: string[];
  features: ProductFeature[];
  workflow: ProductFeature[];
  safeguards: ProductFeature[];
  plans: ProductPlan[];
  disclaimer: string;
};

export type ProductSeed = {
  slug: string;
  dataId: Omit<ProductDefinition, "slug">;
  dataEn: Omit<ProductDefinition, "slug">;
  sortOrder: number;
};

export const productSeeds: ProductSeed[] = [
  {
    slug: "qr-order-pos",
    sortOrder: 1,
    dataId: {
      eyebrow: "F&B COMMERCE PLATFORM",
      title: "RETECH QR Order & POS",
      shortTitle: "QR Order & POS",
      summary: "Menu digital, pemesanan dari meja, kasir, dan insight penjualan dalam satu platform berlangganan.",
      description: "Dibuat untuk cafe, restoran, dan coffee shop yang ingin mempercepat pelayanan tanpa memisahkan pengalaman customer, operasional kasir, dan laporan bisnis.",
      heroImage: "/privacy-safe/qr-order-pos.png",
      heroAlt: "Konsep produk QR ordering, point of sale, dan dashboard analitik RETECH",
      audiences: ["Cafe & coffee shop", "Restoran", "Food court tenant", "Multi-outlet F&B"],
      features: [
        { title: "QR menu per meja", copy: "Customer memindai QR, melihat menu, memilih varian, dan mengirim pesanan tanpa instalasi aplikasi." },
        { title: "Order command center", copy: "Pesanan dine-in, takeaway, dan delivery masuk ke satu antrean dengan status yang mudah dipantau." },
        { title: "POS & pembayaran", copy: "Kasir mengelola transaksi, diskon, metode pembayaran, pembatalan, dan penutupan kas." },
        { title: "Menu & stok", copy: "Kelola kategori, harga, ketersediaan, modifier, serta stok bahan atau produk sesuai paket." },
        { title: "Insight penjualan", copy: "Pantau omzet, jumlah transaksi, produk terlaris, jam ramai, dan performa outlet." },
        { title: "Multi-outlet ready", copy: "Satu akun pemilik dapat melihat outlet, user, menu, dan laporan berdasarkan hak akses." },
      ],
      workflow: [
        { title: "Scan", copy: "Customer memindai QR unik pada meja atau area pemesanan." },
        { title: "Order", copy: "Menu, catatan, varian, dan jumlah pesanan dikirim ke outlet." },
        { title: "Process", copy: "Kasir atau dapur memperbarui status hingga pesanan selesai." },
        { title: "Measure", copy: "Transaksi dan aktivitas tersusun menjadi laporan operasional." },
      ],
      safeguards: [
        { title: "Isolasi data tenant", copy: "Setiap bisnis dipisahkan dengan tenant ID dan kebijakan akses berbasis peran." },
        { title: "Audit operasional", copy: "Perubahan harga, diskon, void, dan status penting dapat dicatat untuk pemeriksaan." },
        { title: "Lifecycle subscription", copy: "Akses mengikuti status trial, aktif, grace period, suspended, atau cancelled." },
      ],
      plans: [
        { name: "QR Menu", price: "Rp99 ribu", unit: "/ outlet / bulan", description: "Menu digital untuk mulai menerima customer dari QR.", features: ["QR menu", "Kategori & modifier", "Jam operasional", "Basic analytics"] },
        { name: "Order Starter", price: "Rp199 ribu", unit: "/ outlet / bulan", description: "Ordering terhubung dengan antrean operasional outlet.", features: ["Semua fitur QR Menu", "Table ordering", "Order status", "Notifikasi pesanan"] },
        { name: "POS Pro", price: "Rp349 ribu", unit: "/ outlet / bulan", description: "POS, transaksi, dan insight untuk operasional harian.", features: ["Semua fitur Order Starter", "Kasir & shift", "Pembayaran & diskon", "Laporan penjualan"], featured: true },
        { name: "Multi Outlet", price: "Mulai Rp599 ribu", unit: "/ bulan", description: "Kontrol terpusat untuk bisnis dengan lebih dari satu outlet.", features: ["Dashboard pemilik", "Role per outlet", "Laporan konsolidasi", "Prioritas support"] },
      ],
      disclaimer: "Biaya setup awal, perangkat kasir, printer, payment gateway, integrasi pihak ketiga, dan kebutuhan custom dihitung terpisah. Harga final mengikuti scope MVP dan kapasitas operasional.",
    },
    dataEn: {
      eyebrow: "F&B COMMERCE PLATFORM",
      title: "RETECH QR Order & POS",
      shortTitle: "QR Order & POS",
      summary: "Digital menus, table ordering, point of sale, and sales insight in one subscription platform.",
      description: "Built for cafés, restaurants, and coffee shops that want faster service without separating the customer journey, cashier operations, and business reporting.",
      heroImage: "/privacy-safe/qr-order-pos.png",
      heroAlt: "RETECH QR ordering, point-of-sale, and analytics product concept",
      audiences: ["Cafés & coffee shops", "Restaurants", "Food-court tenants", "Multi-outlet F&B"],
      features: [
        { title: "Table QR menu", copy: "Guests scan a QR code, browse the menu, select variants, and place an order without installing an app." },
        { title: "Order command center", copy: "Dine-in, takeaway, and delivery orders enter one queue with clear operational statuses." },
        { title: "POS & payments", copy: "Cashiers manage transactions, discounts, payment methods, cancellations, and shift closing." },
        { title: "Menu & stock", copy: "Manage categories, prices, availability, modifiers, and product or ingredient stock by plan." },
        { title: "Sales insight", copy: "Track revenue, transactions, best sellers, peak hours, and outlet performance." },
        { title: "Multi-outlet ready", copy: "One owner account can oversee outlets, users, menus, and reports according to access roles." },
      ],
      workflow: [
        { title: "Scan", copy: "A guest scans the unique QR code assigned to a table or ordering area." },
        { title: "Order", copy: "Menu items, notes, variants, and quantities are sent to the outlet." },
        { title: "Process", copy: "Cashier or kitchen staff updates the order until completion." },
        { title: "Measure", copy: "Transactions and activity become structured operational reports." },
      ],
      safeguards: [
        { title: "Tenant isolation", copy: "Every business is separated by tenant ID and role-based access policies." },
        { title: "Operational audit", copy: "Price, discount, void, and critical status changes can be recorded for review." },
        { title: "Subscription lifecycle", copy: "Access follows trial, active, grace-period, suspended, or cancelled status." },
      ],
      plans: [
        { name: "QR Menu", price: "IDR 99K", unit: "/ outlet / month", description: "A digital menu to start serving guests through QR.", features: ["QR menu", "Categories & modifiers", "Operating hours", "Basic analytics"] },
        { name: "Order Starter", price: "IDR 199K", unit: "/ outlet / month", description: "Ordering connected to an outlet operations queue.", features: ["Everything in QR Menu", "Table ordering", "Order status", "Order notifications"] },
        { name: "POS Pro", price: "IDR 349K", unit: "/ outlet / month", description: "POS, transactions, and insight for daily operations.", features: ["Everything in Order Starter", "Cashier & shifts", "Payments & discounts", "Sales reporting"], featured: true },
        { name: "Multi Outlet", price: "From IDR 599K", unit: "/ month", description: "Centralized control for businesses with multiple outlets.", features: ["Owner dashboard", "Outlet roles", "Consolidated reports", "Priority support"] },
      ],
      disclaimer: "Initial setup, cashier devices, printers, payment gateways, third-party integrations, and custom requirements are quoted separately. Final pricing follows the agreed MVP scope and operational capacity.",
    },
  },
  {
    slug: "attendance",
    sortOrder: 2,
    dataId: {
      eyebrow: "WORKFORCE OPERATIONS",
      title: "RETECH Attendance",
      shortTitle: "Attendance",
      summary: "Absensi foto berbasis lokasi, jadwal, cuti, approval, dan dashboard HR untuk seluruh customer dari satu platform.",
      description: "Dirancang untuk perusahaan yang membutuhkan proses kehadiran lebih terukur, mudah diaudit, dan dapat berkembang dari tim kecil hingga banyak cabang.",
      heroImage: "/privacy-safe/android-attendance.png",
      heroAlt: "Konsep aplikasi absensi aman berbasis foto, lokasi, timestamp, dan riwayat",
      audiences: ["Tim lapangan", "Retail & multi-branch", "Logistik", "Professional services"],
      features: [
        { title: "Photo attendance", copy: "Check-in dan check-out menyimpan bukti foto sesuai kebijakan perusahaan." },
        { title: "Location & geofence", copy: "Validasi radius lokasi membantu memastikan kehadiran dilakukan di area yang disetujui." },
        { title: "Timestamp audit", copy: "Waktu server, perangkat, lokasi, dan status pemeriksaan disusun menjadi jejak audit." },
        { title: "Shift & discipline", copy: "Kelola jadwal, keterlambatan, pulang cepat, lembur, dan pengecualian." },
        { title: "Leave workflow", copy: "Pengajuan cuti, approval, sisa kuota, dan riwayat tersedia dalam satu alur." },
        { title: "HR dashboard", copy: "Analitik kehadiran, ketersediaan tim, export laporan, dan kontrol user berbasis role." },
      ],
      workflow: [
        { title: "Verify", copy: "Aplikasi memeriksa sesi, perangkat, izin, serta kebijakan lokasi." },
        { title: "Capture", copy: "Karyawan mengambil foto dan mengirim titik lokasi serta timestamp." },
        { title: "Review", copy: "HR melihat status, exception, keterlambatan, dan pengajuan." },
        { title: "Report", copy: "Data periode dapat difilter dan disiapkan untuk proses administratif." },
      ],
      safeguards: [
        { title: "Fake/mock location signals", copy: "Indikasi mock location dan anomali perangkat menjadi sinyal pemeriksaan, bukan satu-satunya bukti." },
        { title: "Data minimization", copy: "Foto dan lokasi diproses sesuai kebutuhan kehadiran, masa simpan, serta hak akses yang disepakati." },
        { title: "Tenant & role isolation", copy: "Data setiap perusahaan terpisah dan akses HR, manager, serta karyawan dibatasi per peran." },
      ],
      plans: [
        { name: "Lite", price: "Rp99 ribu", unit: "/ perusahaan / bulan", description: "Untuk tim kecil hingga 10 karyawan.", features: ["Photo attendance", "Lokasi & timestamp", "Riwayat kehadiran", "1 admin"] },
        { name: "Growth", price: "Rp12,5 ribu", unit: "/ karyawan / bulan", description: "Operasional kehadiran dan cuti untuk tim berkembang.", features: ["Semua fitur Lite", "Shift & keterlambatan", "Cuti & approval", "Export laporan"], featured: true },
        { name: "Secure", price: "Rp17,5 ribu", unit: "/ karyawan / bulan", description: "Kontrol dan audit lebih kuat untuk tim multi-lokasi.", features: ["Semua fitur Growth", "Geofence policy", "Device risk signals", "Audit & role detail"] },
        { name: "Enterprise", price: "Hubungi kami", unit: "custom", description: "Kebutuhan cabang, integrasi, atau kebijakan khusus.", features: ["SSO/API sesuai scope", "Custom workflow", "Dedicated onboarding", "SLA terpisah"] },
      ],
      disclaimer: "Minimum billing, biaya onboarding, penyimpanan foto di atas kuota, integrasi payroll, perangkat, dan kebutuhan custom dihitung terpisah. Kebijakan privasi karyawan tetap menjadi tanggung jawab bersama RETECH dan customer sesuai perannya.",
    },
    dataEn: {
      eyebrow: "WORKFORCE OPERATIONS",
      title: "RETECH Attendance",
      shortTitle: "Attendance",
      summary: "Location-based photo attendance, schedules, leave, approvals, and HR dashboards for every customer in one platform.",
      description: "Designed for companies that need attendance to be more measurable, auditable, and ready to scale from a small team to multiple branches.",
      heroImage: "/privacy-safe/android-attendance.png",
      heroAlt: "Secure attendance application concept with photo, location, timestamp, and history",
      audiences: ["Field teams", "Retail & multi-branch", "Logistics", "Professional services"],
      features: [
        { title: "Photo attendance", copy: "Check-in and check-out retain photo evidence according to company policy." },
        { title: "Location & geofence", copy: "Location-radius validation helps confirm attendance from an approved area." },
        { title: "Timestamp audit", copy: "Server time, device, location, and validation status form a reviewable audit trail." },
        { title: "Shift & discipline", copy: "Manage schedules, lateness, early departures, overtime, and exceptions." },
        { title: "Leave workflow", copy: "Leave requests, approvals, balances, and history live in one workflow." },
        { title: "HR dashboard", copy: "Attendance analytics, team availability, report export, and role-based user control." },
      ],
      workflow: [
        { title: "Verify", copy: "The app checks the session, device, permissions, and location policy." },
        { title: "Capture", copy: "The employee submits a photo, location point, and timestamp." },
        { title: "Review", copy: "HR reviews status, exceptions, lateness, and requests." },
        { title: "Report", copy: "Period data can be filtered and prepared for administrative processing." },
      ],
      safeguards: [
        { title: "Fake/mock location signals", copy: "Mock-location and device anomalies become review signals rather than the sole evidence." },
        { title: "Data minimization", copy: "Photos and location are processed according to attendance need, retention, and agreed access rights." },
        { title: "Tenant & role isolation", copy: "Every company is isolated, with HR, manager, and employee access limited by role." },
      ],
      plans: [
        { name: "Lite", price: "IDR 99K", unit: "/ company / month", description: "For small teams of up to 10 employees.", features: ["Photo attendance", "Location & timestamp", "Attendance history", "1 administrator"] },
        { name: "Growth", price: "IDR 12.5K", unit: "/ employee / month", description: "Attendance and leave operations for growing teams.", features: ["Everything in Lite", "Shifts & lateness", "Leave & approvals", "Report export"], featured: true },
        { name: "Secure", price: "IDR 17.5K", unit: "/ employee / month", description: "Stronger controls and audit for multi-location teams.", features: ["Everything in Growth", "Geofence policy", "Device risk signals", "Detailed audit & roles"] },
        { name: "Enterprise", price: "Contact us", unit: "custom", description: "Branch, integration, or policy-specific requirements.", features: ["SSO/API by scope", "Custom workflow", "Dedicated onboarding", "Separate SLA"] },
      ],
      disclaimer: "Minimum billing, onboarding, photo storage above quota, payroll integration, devices, and custom requirements are quoted separately. Employee privacy obligations remain a shared responsibility between RETECH and the customer according to their roles.",
    },
  },
];

export function getFallbackProducts(locale: Locale): ProductDefinition[] {
  return productSeeds.map((seed) => ({ slug: seed.slug, ...(locale === "en" ? seed.dataEn : seed.dataId) }));
}
