import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "../../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fallbackProjects, getProject } from "@/lib/projects";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fallbackProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: "Case Study" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: PageProps) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return (
    <main>
      <SiteHeader />
      <article className="case-study">
        <header className="case-hero">
          <Link className="back-link" href="/work">← All case studies</Link>
          <div className="case-meta">
            <span>{project.category}</span>
            <span className={`project-status ${project.status}`}>{project.status === "live" ? "Delivered" : "In development"}</span>
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="service-tags case-tags">
            {project.services.map((service) => <span key={service}>{service}</span>)}
          </div>
        </header>

        {project.gallery.length ? (
          <section className={`case-gallery${project.slug === "android-attendance-app" ? " case-gallery-mobile" : ""}`} aria-label={`Galeri ${project.title}`}>
            {project.gallery.map((image, index) => (
              <figure className={index === 0 ? "case-shot case-shot-wide" : "case-shot"} key={image.src}>
                <div className="browser-frame">
                  <div className="browser-bar"><i /><i /><i /><span>Privacy-safe project view</span></div>
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
            <h2>Development follows next.</h2>
            <p>Screenshot akan ditambahkan setelah tampilan aplikasi siap dan lolos pengecekan privasi.</p>
          </section>
        )}

        <section className="case-story">
          <div><span>01 / CHALLENGE</span><h2>Tantangan</h2><p>{project.challenge}</p></div>
          <div><span>02 / SOLUTION</span><h2>Solusi</h2><p>{project.solution}</p></div>
          <div><span>03 / OUTCOME</span><h2>Hasil</h2><p>{project.outcome}</p></div>
        </section>

        <aside className="case-confidentiality">
          <strong>Confidentiality by design</strong>
          <p>Case study ini telah dianonimkan. Identitas customer, logo, email, alamat, user, serta data infrastruktur sensitif tidak dipublikasikan.</p>
        </aside>

        <section className="case-next">
          <span className="kicker">BUILD YOUR NEXT SYSTEM</span>
          <h2>Let&apos;s turn your<br /><em>challenge into progress.</em></h2>
          <Link className="button button-primary" href="/#contact">Start a conversation <span>↗</span></Link>
        </section>
      </article>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
