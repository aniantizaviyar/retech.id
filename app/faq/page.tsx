import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { faqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan umum tentang website, aplikasi, Managed IT Services, remote support, domain, hosting, biaya, dan proses kerja RETECH.",
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", url: "/faq", title: "Frequently Asked Questions | RETECH", description: "Jawaban singkat mengenai layanan dan proses kerja RETECH.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Frequently Asked Questions | RETECH", images: ["/og.png"] },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://retech.id/faq#faq",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <section className="faq-hero"><span className="kicker">FREQUENTLY ASKED QUESTIONS</span><h1>Clear answers.<br /><em>Before we start.</em></h1><p>Informasi dasar untuk membantu Anda memahami pilihan layanan, biaya, kepemilikan akun, dan proses kerja RETECH.</p></section>
      <section className="faq-list">
        {faqs.map((faq, index) => <details key={faq.question}><summary><span>0{index + 1}</span>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </section>
      <section className="service-bottom-cta"><span className="kicker">STILL HAVE A QUESTION?</span><h2>Tell us what<br /><em>you need.</em></h2><Link className="button button-primary" href="/#contact" data-analytics="contact_cta_click" data-analytics-source="faq">Hubungi RETECH <span>↗</span></Link></section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
