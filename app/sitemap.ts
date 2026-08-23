import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { getServices } from "@/lib/cms-data";
import { localePath } from "@/lib/i18n";

const siteUrl = "https://retech.id";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const services = await getServices("id");
  const baseEntries = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/work", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
    ...services.map((service) => ({ path: `/services/${service.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { path: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.4 },
    ...projects.map((project) => ({ path: `/work/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];

  return baseEntries.flatMap(({ path, changeFrequency, priority }) => {
    const idUrl = `${siteUrl}${localePath("id", path)}`;
    const enUrl = `${siteUrl}${localePath("en", path)}`;
    const alternates = { languages: { id: idUrl, en: enUrl, "x-default": idUrl } };
    return [
      { url: idUrl, changeFrequency, priority, alternates },
      { url: enUrl, changeFrequency, priority, alternates },
    ];
  });
}
