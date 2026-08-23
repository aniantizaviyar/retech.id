import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getFaqs, getPageContent } from "@/lib/cms-data";
import { absoluteLocaleUrl, languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/faq");
  const description = en ? "Common questions about websites, applications, Managed IT Services, remote support, domains, hosting, pricing, and the RETECH delivery process." : "Pertanyaan umum tentang website, aplikasi, Managed IT Services, remote support, domain, hosting, biaya, dan proses kerja RETECH.";
  return { title: "FAQ", description, alternates: { canonical, languages: languageAlternates("/faq") }, openGraph: { type: "website", url: canonical, title: "Frequently Asked Questions | RETECH", description, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: "Frequently Asked Questions | RETECH", description, images: ["/og.png"] } };
}

export default async function FaqPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const faqs = await getFaqs(locale);
  const pageContent = await getPageContent("faq", locale);
  const pageUrl = absoluteLocaleUrl(locale, "/faq");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />
      <section className="faq-hero"><span className="kicker">FREQUENTLY ASKED QUESTIONS</span><h1>Clear answers.<br /><em>Before we start.</em></h1><p>{String(pageContent.heroIntro || (en ? "Essential information to help you understand service options, pricing, account ownership, and the RETECH delivery process." : "Informasi dasar untuk membantu Anda memahami pilihan layanan, biaya, kepemilikan akun, dan proses kerja RETECH."))}</p></section>
      <section className="faq-list">
        {faqs.map((faq, index) => <details key={faq.question}><summary><span>0{index + 1}</span>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </section>
      <section className="service-bottom-cta"><span className="kicker">STILL HAVE A QUESTION?</span><h2>{String(pageContent.ctaTitle || (en ? "Still have a question?" : "Masih ada pertanyaan?"))}</h2><p>{String(pageContent.ctaIntro || "")}</p><Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="faq">{en ? "Contact RETECH" : "Hubungi RETECH"} <span>↗</span></Link></section>
      <SiteFooter locale={locale} /><ChatWidget locale={locale} />
    </main>
  );
}
