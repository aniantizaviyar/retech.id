import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "../../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fallbackProjects, getProject } from "@/lib/projects";
import { absoluteLocaleUrl, languageAlternates, localeConfig, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fallbackProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const project = await getProject(slug, locale);
  if (!project) return { title: "Case Study" };
  const basePath = `/work/${project.slug}`;
  const path = localePath(locale, basePath);
  const image = project.gallery[0]?.src || "/og.png";
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: path, languages: languageAlternates(basePath) },
    openGraph: {
      type: "article",
      url: path,
      title: `${project.title} | RETECH`,
      description: project.summary,
      images: [{ url: image, alt: project.gallery[0]?.alt || project.title }],
    },
    twitter: { card: "summary_large_image", title: `${project.title} | RETECH`, description: project.summary, images: [image] },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const locale = await getLocale();
  const en = locale === "en";
  const project = await getProject((await params).slug, locale);
  if (!project) notFound();

  const projectUrl = absoluteLocaleUrl(locale, `/work/${project.slug}`);
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${projectUrl}#case-study`,
    name: project.title,
    description: project.summary,
    url: projectUrl,
    inLanguage: localeConfig[locale].schemaLang,
    creator: { "@id": "https://retech.id/#organization" },
    keywords: project.services.join(", "),
    image: project.gallery.map((image) => `https://retech.id${image.src}`),
    about: project.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: en ? "Home" : "Beranda", item: absoluteLocaleUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: absoluteLocaleUrl(locale, "/work") },
      { "@type": "ListItem", position: 3, name: project.title, item: projectUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />
      <article className="case-study">
        <header className="case-hero">
          <Link className="back-link" href={localePath(locale, "/work")}>← {en ? "All case studies" : "Semua case study"}</Link>
          <div className="case-meta">
            <span>{project.category}</span>
            <span className={`project-status ${project.status}`}>{project.status === "live" ? (en ? "Delivered" : "Selesai") : (en ? "In development" : "Dalam pengembangan")}</span>
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="service-tags case-tags">
            {project.services.map((service) => <span key={service}>{service}</span>)}
          </div>
        </header>

        {project.gallery.length ? (
          <section className={`case-gallery${project.slug === "android-attendance-app" ? " case-gallery-mobile" : ""}`} aria-label={`${en ? "Gallery" : "Galeri"} ${project.title}`}>
            {project.gallery.map((image, index) => (
              <figure className={index === 0 ? "case-shot case-shot-wide" : "case-shot"} key={image.src}>
                <div className="browser-frame">
                  <div className="browser-bar"><i /><i /><i /><span>{en ? "Privacy-safe project view" : "Tampilan project yang aman untuk privasi"}</span></div>
                  <div className="browser-image">
                    <Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 90vw" priority={index === 0} />
                  </div>
                </div>
                <figcaption>{image.alt}</figcaption>
              </figure>
            ))}
          </section>
        ) : (
          <section className="case-coming-soon">
            <span>ANDROID APPLICATION</span>
            <h2>{en ? "Development follows next." : "Pengembangan berikutnya."}</h2>
            <p>{en ? "Screenshots will be added after the application interface is ready and passes a privacy review." : "Screenshot akan ditambahkan setelah tampilan aplikasi siap dan lolos pengecekan privasi."}</p>
          </section>
        )}

        <section className="case-story">
          <div><span>01 / CHALLENGE</span><h2>{en ? "Challenge" : "Tantangan"}</h2><p>{project.challenge}</p></div>
          <div><span>02 / SOLUTION</span><h2>{en ? "Solution" : "Solusi"}</h2><p>{project.solution}</p></div>
          <div><span>03 / OUTCOME</span><h2>{en ? "Outcome" : "Hasil"}</h2><p>{project.outcome}</p></div>
        </section>

        <aside className="case-confidentiality">
          <strong>Confidentiality by design</strong>
          <p>{en ? "This case study has been anonymized. Customer identities, logos, emails, addresses, users, and sensitive infrastructure data are not published." : "Case study ini telah dianonimkan. Identitas customer, logo, email, alamat, user, serta data infrastruktur sensitif tidak dipublikasikan."}</p>
        </aside>

        <section className="case-next">
          <span className="kicker">BUILD YOUR NEXT SYSTEM</span>
          <h2>Let&apos;s turn your<br /><em>challenge into progress.</em></h2>
          <Link className="button button-primary" href={localePath(locale, "/#contact")} data-analytics="contact_cta_click" data-analytics-source={`case_${project.slug}`}>{en ? "Start a conversation" : "Mulai percakapan"} <span>↗</span></Link>
        </section>
      </article>
      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </main>
  );
}
