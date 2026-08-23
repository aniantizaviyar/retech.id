import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { localePath, type Locale } from "@/lib/i18n";

export function ProjectCard({ project, locale, index = 0 }: { project: Project; locale: Locale; index?: number }) {
  const cover = project.gallery[0];
  const en = locale === "en";
  return (
    <Link className={`project-card project-card-${(index % 3) + 1}`} href={localePath(locale, `/work/${project.slug}`)}>
      <div className="project-media">
        {cover ? (
          <Image src={cover.src} alt={cover.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
        ) : (
          <div className="project-placeholder" aria-label={en ? "Project in development" : "Project sedang dalam pengembangan"}>
            <span>ANDROID</span>
            <strong>{en ? "Coming next" : "Segera hadir"}</strong>
          </div>
        )}
        <span className={`project-status ${project.status}`}>{project.status === "live" ? (en ? "Delivered" : "Selesai") : (en ? "In development" : "Dalam pengembangan")}</span>
      </div>
      <div className="project-card-copy">
        <span className="project-category">{project.category}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="project-card-bottom">
          <span>{project.services.slice(0, 3).join(" · ")}</span>
          <b aria-hidden="true">↗</b>
        </div>
      </div>
    </Link>
  );
}
