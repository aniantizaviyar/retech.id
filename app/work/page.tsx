import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkGrid } from "@/components/WorkGrid";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Pilihan website, aplikasi bisnis, HRMS, dan sistem monitoring yang dibangun RETECH.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <main>
      <SiteHeader />
      <section className="work-hero">
        <span className="kicker">CASE STUDIES</span>
        <h1>Technology in action.<br /><em>Built for real work.</em></h1>
        <div className="work-hero-copy">
          <p>Website, aplikasi operasional, HRMS, dan monitoring infrastructure yang dirancang untuk kebutuhan bisnis sehari-hari.</p>
          <span className="privacy-note">Nama, logo, email, alamat, dan data sensitif customer tidak ditampilkan.</span>
        </div>
      </section>
      <section className="work-listing">
        <WorkGrid projects={projects} />
      </section>
      <section className="work-cta">
        <span className="kicker">YOUR PROJECT, NEXT</span>
        <h2>Punya tantangan yang<br /><em>mirip?</em></h2>
        <p>Kami bisa mulai dari discovery singkat untuk memetakan kebutuhan, risiko, dan tahap implementasi paling masuk akal.</p>
        <Link className="button button-primary" href="/#contact">Discuss your project <span>↗</span></Link>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
