"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";
import type { Locale } from "@/lib/i18n";

const filters = ["All", "Digital Product", "Business Application", "Managed IT", "Mobile Application"];

export function WorkGrid({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const en = locale === "en";
  const [filter, setFilter] = useState("All");
  const visible = useMemo(
    () => filter === "All" ? projects : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  return (
    <>
      <div className="work-filters" aria-label={en ? "Filter case studies" : "Filter studi kasus"}>
        {filters.map((item) => (
          <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} type="button">
            {item === "All" && !en ? "Semua" : item}
          </button>
        ))}
      </div>
      <div className="project-grid work-page-grid">
        {visible.map((project, index) => <ProjectCard key={project.slug} project={project} locale={locale} index={index} />)}
      </div>
    </>
  );
}
