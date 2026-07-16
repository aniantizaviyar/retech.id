import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const cover = project.gallery[0];
  return (
    <Link className={`project-card project-card-${(index % 3) + 1}`} href={`/work/${project.slug}`}>
      <div className="project-media">
        {cover ? (
          <Image src={cover.src} alt={cover.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
        ) : (
          <div className="project-placeholder" aria-label="Project sedang dalam pengembangan">
            <span>ANDROID</span>
            <strong>Coming next</strong>
          </div>
        )}
        <span className={`project-status ${project.status}`}>{project.status === "live" ? "Delivered" : "In development"}</span>
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
