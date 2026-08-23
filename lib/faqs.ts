import type { Locale } from "./i18n";

export const faqs = [
  {
    question: "Apa perbedaan website company profile, Website + CMS, dan web application?",
    answer:
      "Company profile berfokus pada informasi bisnis. Website + CMS menambahkan area admin untuk mengelola konten. Web application menjalankan proses bisnis yang lebih kompleks seperti role, approval, transaksi, integrasi, dan reporting.",
  },
  {
    question: "Apa perbedaan WordPress dengan website custom menggunakan Next.js, React, atau Laravel?",
    answer:
      "WordPress cocok untuk website berbasis konten yang membutuhkan pengelolaan cepat dengan fitur standar. Custom development lebih tepat ketika bisnis membutuhkan UI khusus, performa tinggi, integrasi, keamanan, workflow, atau fitur yang tidak dapat dipenuhi plugin standar. RETECH merekomendasikan pendekatan berdasarkan kebutuhan, anggaran, dan rencana pengembangan—bukan sekadar memilih teknologi yang paling mahal.",
  },
  {
    question: "Apakah RETECH menggunakan teknologi modern?",
    answer:
      "Ya. Sesuai kebutuhan project, RETECH dapat menggunakan Next.js, React, TypeScript, Laravel/PHP, REST API, database SQL, dan Flutter untuk Android serta iOS. Stack final ditentukan setelah discovery agar solusi tetap cepat, aman, mudah dirawat, dan siap dikembangkan tanpa menambah kompleksitas yang tidak diperlukan.",
  },
  {
    question: "Apakah RETECH dapat membuat aplikasi Android dan iOS?",
    answer:
      "Ya. RETECH dapat mengembangkan aplikasi Android saja atau Android dan iOS. Scope ditentukan dari fitur, backend, integrasi, kebutuhan perangkat, dan target distribusi aplikasi.",
  },
  {
    question: "Apakah biaya domain, hosting, dan cloud server sudah termasuk?",
    answer:
      "Tidak otomatis. Domain, hosting, cloud, lisensi, dan layanan pihak ketiga merupakan biaya berulang dan dicantumkan terpisah. Akun serta kepemilikannya tetap atas nama customer.",
  },
  {
    question: "Apakah RETECH membantu publikasi ke Google Play dan Apple App Store?",
    answer:
      "RETECH dapat membantu menyiapkan build dan proses submission. Customer menyediakan akun developer, menyelesaikan verifikasi, dan menanggung biaya Google Play atau Apple Developer.",
  },
  {
    question: "Apa saja yang termasuk Managed IT Services?",
    answer:
      "Cakupannya dapat meliputi maintenance server, monitoring server dan jaringan, helpdesk, pemeriksaan backup, restore support, patching, serta laporan kondisi infrastruktur sesuai paket yang disepakati.",
  },
  {
    question: "Apakah remote support tersedia untuk satu kali pekerjaan?",
    answer:
      "Ya. Remote support dapat digunakan untuk satu insiden atau pekerjaan terdefinisi, seperti troubleshooting, instalasi service, konfigurasi server, migrasi, dan hardening.",
  },
  {
    question: "Berapa lama estimasi pengerjaan project?",
    answer:
      "Timeline bergantung pada jumlah fitur, kesiapan materi, integrasi, proses approval, dan prioritas. Estimasi diberikan setelah discovery singkat dan ruang lingkup awal disepakati.",
  },
  {
    question: "Bagaimana cara mendapatkan quotation?",
    answer:
      "Isi form inquiry dengan nama, nomor WhatsApp, jenis layanan, dan kebutuhan. Tim RETECH akan meninjau scope lalu menghubungi Anda untuk klarifikasi dan estimasi awal.",
  },
] as const;

export const englishFaqs = [
  { question: "What is the difference between a company profile website, Website + CMS, and a web application?", answer: "A company profile focuses on business information. Website + CMS adds an admin area for content management. A web application runs more complex business processes involving roles, approvals, transactions, integrations, and reporting." },
  { question: "What is the difference between WordPress and a custom website built with Next.js, React, or Laravel?", answer: "WordPress is suitable for content-driven websites that need fast setup and standard features. Custom development is a better fit when a business needs a tailored UI, higher performance, integrations, security controls, workflows, or functionality that standard plugins cannot provide. RETECH recommends an approach based on requirements, budget, and growth plans—not simply the most expensive technology." },
  { question: "Does RETECH use modern technology?", answer: "Yes. Depending on the project, RETECH can use Next.js, React, TypeScript, Laravel/PHP, REST APIs, SQL databases, and Flutter for Android and iOS. The final stack is selected after discovery so the solution remains fast, secure, maintainable, and ready to grow without unnecessary complexity." },
  { question: "Can RETECH build Android and iOS applications?", answer: "Yes. RETECH can develop an Android-only application or a combined Android and iOS solution. The scope is based on features, backend requirements, integrations, device capabilities, and the intended distribution model." },
  { question: "Are domain, hosting, and cloud server costs included?", answer: "Not automatically. Domains, hosting, cloud services, licenses, and third-party services are recurring costs and are quoted separately. Accounts and ownership remain under the customer's name." },
  { question: "Does RETECH help publish apps to Google Play and the Apple App Store?", answer: "RETECH can help prepare production builds and support the submission process. The customer provides the developer accounts, completes verification, and covers Google Play or Apple Developer fees." },
  { question: "What is included in Managed IT Services?", answer: "The scope may include server maintenance, server and network monitoring, helpdesk support, backup checks, restore support, patching, and infrastructure health reports according to the agreed package." },
  { question: "Is remote support available for a one-time job?", answer: "Yes. Remote support can be used for a single incident or a defined task such as troubleshooting, service installation, server configuration, migration, or hardening." },
  { question: "How long does a project take?", answer: "The timeline depends on the number of features, content readiness, integrations, approval cycles, and priority. An estimate is provided after a short discovery and agreement on the initial scope." },
  { question: "How do I request a quotation?", answer: "Complete the inquiry form with your name, WhatsApp number, service type, and requirements. The RETECH team will review the scope and contact you for clarification and an initial estimate." },
] as const;

export function getFaqs(locale: Locale) {
  return locale === "en" ? englishFaqs : faqs;
}
