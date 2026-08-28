export type PageContentValue = string | string[] | Array<Record<string, string>>;
export type PageContent = Record<string, PageContentValue>;
export type CmsPageSeed = { slug: string; label: string; dataId: PageContent; dataEn: PageContent };

export const cmsPageSeeds: CmsPageSeed[] = [
  {
    slug: "home",
    label: "Homepage",
    dataId: {
      heroBadge: "Your IT partner for what's next",
      heroTitle: "Technology that works.",
      heroTitleAccent: "Business that grows.",
      heroIntro: "RETECH membantu bisnis membangun produk digital, menjaga infrastruktur, dan menyelesaikan tantangan IT—dari ide hingga operasional.",
      servicesIntro: "Tiga lini layanan yang menghubungkan pembangunan produk, stabilitas operasional, dan dukungan teknis menjadi satu solusi.",
      workIntro: "Implementasi website, aplikasi bisnis, HRMS, dan monitoring yang dipilih dari sistem aktif.",
      processIntro: "Kami mulai dari kebutuhan bisnis, menyusun solusi yang tepat, lalu menjaga hasilnya tetap optimal.",
      process: [
        { title: "Discover", copy: "Memahami tujuan, tantangan, pengguna, dan sistem yang sudah berjalan." },
        { title: "Design & Deliver", copy: "Merancang solusi, mengembangkan secara iteratif, dan menguji bagian penting." },
        { title: "Operate & Improve", copy: "Memantau, mendukung, dan meningkatkan performa secara berkelanjutan." },
      ],
      contactIntro: "Ceritakan kebutuhan IT Anda. Inquiry akan tersimpan dengan aman dan tim RETECH akan menghubungi Anda untuk langkah berikutnya.",
      contactSteps: ["Pilih layanan dan jelaskan kebutuhan Anda.", "Tim kami meninjau scope dan menghubungi Anda.", "Kami susun solusi serta estimasi yang relevan."],
    },
    dataEn: {
      heroBadge: "Your IT partner for what's next",
      heroTitle: "Technology that works.",
      heroTitleAccent: "Business that grows.",
      heroIntro: "RETECH helps businesses build digital products, maintain infrastructure, and solve IT challenges—from idea to daily operations.",
      servicesIntro: "Three service lines connecting product development, operational stability, and technical support into one solution.",
      workIntro: "Selected website, business application, HRMS, and monitoring implementations from active systems.",
      processIntro: "We start with the business need, shape the right solution, and keep the outcome performing at its best.",
      process: [
        { title: "Discover", copy: "Understand goals, challenges, users, and the systems already in place." },
        { title: "Design & Deliver", copy: "Design the solution, build iteratively, and test critical functions." },
        { title: "Operate & Improve", copy: "Monitor, support, and continuously improve performance." },
      ],
      contactIntro: "Tell us about your IT needs. Your inquiry will be stored securely and the RETECH team will contact you about the next step.",
      contactSteps: ["Select a service and describe what you need.", "Our team reviews the scope and contacts you.", "We prepare a relevant solution and estimate."],
    },
  },
  {
    slug: "about",
    label: "About Us",
    dataId: {
      heroTitle: "Technology with",
      heroTitleAccent: "business context.",
      heroIntro: "PT. Retech Digital Solution—RETECH—adalah partner teknologi B2B yang membantu bisnis membangun produk digital, menjaga infrastruktur, dan menyelesaikan kebutuhan server secara terarah.",
      purposeTitle: "Teknologi harus mempermudah operasi—",
      purposeTitleAccent: "bukan menambah kompleksitas.",
      purposeCopy: "Misi kami adalah menerjemahkan kebutuhan bisnis menjadi solusi digital yang relevan, aman, dapat dipelihara, dan siap berkembang. Kami menggabungkan product development, infrastructure operations, serta server expertise agar keputusan teknis tetap terhubung dengan hasil bisnis.",
      principlesIntro: "Prinsip kerja yang menjaga kualitas delivery, kejelasan kolaborasi, dan kepercayaan jangka panjang.",
      capabilitiesIntro: "RETECH menghubungkan tiga lapisan yang sering ditangani terpisah: pembangunan produk, stabilitas operasional, dan dukungan teknis.",
      companyIntro: "Kunjungan ke business address dilakukan berdasarkan janji temu.",
      trustCopy: "Kami mengutamakan kerahasiaan informasi customer, akses berbasis kebutuhan, dokumentasi, dan handover yang jelas. Teknologi dipilih sesuai konteks—bukan karena tren semata—dengan perhatian pada keamanan, performa, biaya operasional, dan kemampuan pengembangan berikutnya.",
    },
    dataEn: {
      heroTitle: "Technology with",
      heroTitleAccent: "business context.",
      heroIntro: "PT. Retech Digital Solution—RETECH—is a B2B technology partner that helps businesses build digital products, maintain infrastructure, and deliver server solutions with a clear direction.",
      purposeTitle: "Technology should simplify operations—",
      purposeTitleAccent: "not add complexity.",
      purposeCopy: "Our mission is to translate business needs into digital solutions that are relevant, secure, maintainable, and ready to grow. We combine product development, infrastructure operations, and server expertise so technical decisions stay connected to business outcomes.",
      principlesIntro: "Principles that protect delivery quality, clarity in collaboration, and long-term trust.",
      capabilitiesIntro: "RETECH connects three layers that are often handled separately: product development, operational stability, and technical support.",
      companyIntro: "Visits to our business address are available by appointment.",
      trustCopy: "We prioritize customer confidentiality, need-based access, documentation, and clear handover. Technology is selected for the context—not simply because it is trending—with attention to security, performance, operating cost, and future extensibility.",
    },
  },
  {
    slug: "services",
    label: "Services Directory",
    dataId: { heroTitle: "Build. Operate.", heroTitleAccent: "Move forward.", heroIntro: "Satu partner untuk membangun produk digital, menjaga infrastruktur, dan menyelesaikan kebutuhan server secara terarah.", ctaTitle: "Ceritakan kondisi Anda.", ctaTitleAccent: "Kami petakan langkah berikutnya.", ctaIntro: "Mulai dari kebutuhan dan kendala saat ini—kami bantu menentukan scope yang paling relevan." },
    dataEn: { heroTitle: "Build. Operate.", heroTitleAccent: "Move forward.", heroIntro: "One partner to build digital products, maintain infrastructure, and deliver server solutions with a clear direction.", ctaTitle: "Tell us where you are.", ctaTitleAccent: "We'll map the way forward.", ctaIntro: "Start with your current needs and constraints—we will help define the most relevant scope." },
  },
  {
    slug: "work",
    label: "Case Studies Directory",
    dataId: { heroTitle: "Technology in action.", heroTitleAccent: "Built for real work.", heroIntro: "Website, aplikasi operasional, HRMS, dan monitoring infrastructure yang dirancang untuk kebutuhan kerja sehari-hari.", privacyNote: "Nama customer, logo, email, alamat, dan data sensitif tidak ditampilkan.", ctaTitle: "Punya tantangan serupa?", ctaIntro: "Kami dapat memulai dengan discovery singkat untuk memetakan kebutuhan, risiko, dan jalur implementasi yang paling masuk akal." },
    dataEn: { heroTitle: "Technology in action.", heroTitleAccent: "Built for real work.", heroIntro: "Websites, operational applications, HRMS platforms, and infrastructure monitoring designed for day-to-day business needs.", privacyNote: "Customer names, logos, emails, addresses, and sensitive data are not displayed.", ctaTitle: "Facing a similar challenge?", ctaIntro: "We can begin with a short discovery to map requirements, risks, and the most practical implementation path." },
  },
  {
    slug: "products",
    label: "Products Directory",
    dataId: {
      heroTitle: "Software operasional.",
      heroTitleAccent: "Tumbuh bersama bisnis.",
      heroIntro: "Dua produk berlangganan yang dibangun dari pengalaman RETECH mengembangkan sistem operasional: QR Order & POS untuk bisnis F&B dan Attendance untuk pengelolaan kehadiran.",
      ctaTitle: "Mulai dari pilot terarah.",
      ctaTitleAccent: "Scale setelah terbukti.",
      ctaIntro: "Pilot membantu menguji workflow, kesiapan user, dan dampak operasional sebelum rollout lebih luas.",
    },
    dataEn: {
      heroTitle: "Operational software.",
      heroTitleAccent: "Ready to grow with you.",
      heroIntro: "Two subscription products built from RETECH's operational-system experience: QR Order & POS for F&B businesses and Attendance for workforce operations.",
      ctaTitle: "Choose a focused pilot.",
      ctaTitleAccent: "Scale after it works.",
      ctaIntro: "A pilot validates workflows, user readiness, and operational impact before a wider rollout.",
    },
  },
  {
    slug: "pricing",
    label: "Pricing Page",
    dataId: { heroIntro: "Harga berikut adalah estimasi awal untuk membantu perencanaan. Penawaran final dibuat setelah kebutuhan, kompleksitas, dan timeline dipahami.", heroNote: "Harga mulai dari • Bukan tarif tetap", developmentIntro: "Mulai dari website profesional hingga sistem bisnis dan aplikasi mobile custom.", supportIntro: "Pilih bantuan insidental atau pengelolaan rutin sesuai kapasitas dan tingkat risiko sistem.", hostingIntro: "Domain dan cloud adalah biaya berulang. Akun dan kepemilikan tetap atas nama customer; RETECH membantu setup dan pengelolaannya.", hostingDisclaimer: "Harga perpanjangan mengikuti tarif registrar dan cloud provider. Pemakaian resource tinggi, storage besar, email hosting, lisensi, dan layanan pihak ketiga dihitung terpisah.", ctaIntro: "Konsultasi awal membantu menentukan pendekatan, prioritas, biaya, dan timeline yang paling masuk akal." },
    dataEn: { heroIntro: "The following prices are starting estimates to support planning. A final proposal is prepared after requirements, complexity, and timeline are understood.", heroNote: "Starting prices • Not fixed rates", developmentIntro: "From professional websites to business systems and custom mobile applications.", supportIntro: "Choose one-time assistance or recurring management based on capacity and system risk.", hostingIntro: "Domains and cloud services are recurring costs. Accounts and ownership remain under the customer's name; RETECH assists with setup and management.", hostingDisclaimer: "Renewal pricing follows registrar and cloud-provider rates. High resource usage, large storage, email hosting, licenses, and third-party services are quoted separately.", ctaIntro: "An initial consultation helps determine the most practical approach, priorities, budget, and timeline." },
  },
  {
    slug: "faq",
    label: "FAQ Page",
    dataId: { heroIntro: "Informasi penting untuk membantu Anda memahami pilihan layanan, biaya, kepemilikan akun, dan proses kerja RETECH.", ctaTitle: "Masih ada pertanyaan?", ctaIntro: "Ceritakan kebutuhan atau kondisi sistem Anda. Tim RETECH akan membantu mengarahkan langkah berikutnya." },
    dataEn: { heroIntro: "Essential information to help you understand service options, pricing, account ownership, and the RETECH delivery process.", ctaTitle: "Still have a question?", ctaIntro: "Tell us about your requirements or current system. The RETECH team will help direct the next step." },
  },
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    dataId: { intro: "Kebijakan ini menjelaskan bagaimana PT. Retech Digital Solution (\"RETECH\", \"kami\") memproses data ketika Anda mengakses retech.id, menggunakan assistant, atau mengirim inquiry.", summary: "RETECH tidak menjual atau menyewakan data pribadi. Kami mengumpulkan data yang relevan untuk menanggapi inquiry, menjaga keamanan layanan, dan memahami performa website." },
    dataEn: { intro: "This policy explains how PT. Retech Digital Solution (\"RETECH\", \"we\") processes data when you access retech.id, use the assistant, or submit an inquiry.", summary: "RETECH does not sell or rent personal data. We collect relevant data to respond to inquiries, protect our services, and understand website performance." },
  },
];

export function pageSeed(slug: string) {
  return cmsPageSeeds.find((page) => page.slug === slug);
}
