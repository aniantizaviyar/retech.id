import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkGrid } from "@/components/WorkGrid";
import { getProjects } from "@/lib/projects";
import { languageAlternates, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPageContent } from "@/lib/cms-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  const canonical = localePath(locale, "/work");
  const description = en ? "Selected websites, business applications, HRMS platforms, and monitoring systems built by RETECH." : "Pilihan website, aplikasi bisnis, HRMS, dan sistem monitoring yang dibangun RETECH.";
  return { title: "Case Studies", description, alternates: { canonical, languages: languageAlternates("/work") }, openGraph: { type: "website", url: canonical, title: "Case Studies RETECH", description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Case Studies RETECH" }] }, twitter: { card: "summary_large_image", title: "Case Studies RETECH", description, images: ["/og.png"] } };
}

export default async function WorkPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const projects = await getProjects(locale);
  const pageContent = await getPageContent("work", locale);

  return (
    <main>
      <SiteHeader locale={locale} />
      <section className="work-hero">
        <span className="kicker">CASE STUDIES</span>
        <h1>{String(pageContent.heroTitle || "Technology in action.")}<br /><em>{String(pageContent.heroTitleAccent || "Built for real work.")}</em></h1>
        <div className="work-hero-copy">
          <p>{String(pageContent.heroIntro || "")}</p>
          <span className="privacy-note">{String(pageContent.privacyNote || "")}</span>
        </div>
      </section>
      <section className="work-listing">
        <WorkGrid projects={projects} locale={locale} />
      </section>
      <section className="work-cta">
        <span className="kicker">YOUR PROJECT, NEXT</span>
        <h2>{String(pageContent.ctaTitle || (en ? "Facing a similar challenge?" : "Punya tantangan serupa?"))}</h2>
        <p>{String(pageContent.ctaIntro || "")}</p>
        <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source="work">{en ? "Discuss your project" : "Diskusikan project Anda"} <span>↗</span></Link>
      </section>
      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
