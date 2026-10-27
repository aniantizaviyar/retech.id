"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localePath, type Locale } from "@/lib/i18n";
import styles from "./OrbitEcosystem.module.css";

function ServiceIcon({ kind }: { kind: "web" | "mobile" | "server" | "cloud" }) {
  const paths = {
    web: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01m-2 6-2 2 2 2m8-4 2 2-2 2m-3-5-2 7" /></>,
    mobile: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M10 5h4m-3 14h2" /></>,
    server: <><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="18" height="7" rx="2" /><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6m-6 11h6M12 10v4" /></>,
    cloud: <><path d="M7 18a5 5 0 0 1-1-9.9A6.5 6.5 0 0 1 18.5 8 5 5 0 0 1 18 18M12 13v9m-3-3 3 3 3-3" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export function OrbitEcosystem({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [paused, setPaused] = useState(false);
  const [inactive, setInactive] = useState(false);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    let inView = true;
    const update = () => setInactive(document.hidden || !inView);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: "80px" });
    observer?.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const services = [
    { kind: "web" as const, name: "Web app", detail: en ? "Built for your workflow" : "Sesuai alur bisnis", href: "/services/digital-product-development" },
    { kind: "mobile" as const, name: "Mobile", detail: en ? "Connected experiences" : "Pengalaman terhubung", href: "/services/digital-product-development" },
    { kind: "server" as const, name: en ? "Infrastructure" : "Infrastruktur", detail: en ? "Managed operations" : "Operasional terkelola", href: "/services/managed-it-services" },
    { kind: "cloud" as const, name: "Cloud & VPS", detail: en ? "Room to grow" : "Siap berkembang", href: "/services/vps" },
  ];

  return <div className={styles.ecosystem} data-orbit-paused={paused || inactive}>
    <div className={styles.heading}><span>RETECH / CONNECTED SOLUTIONS</span><span className={styles.headingLine} /></div>
    <div ref={scene} className={styles.scene} role="group" aria-label={en ? "RETECH service ecosystem" : "Ekosistem layanan RETECH"}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.outerRing} aria-hidden="true" />
      <div className={styles.innerRing} aria-hidden="true" />
      <div className={styles.axis} aria-hidden="true" />
      <div className={styles.core}>
        <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} unoptimized />
      </div>
      <div className={styles.track}>
        {services.map((service, index) => <div key={service.kind} className={`${styles.position} ${styles[`position${index}`]}`}>
          <div className={styles.counterRotation}>
            <Link className={styles.node} href={localePath(locale, service.href)} aria-label={`${service.name} — ${service.detail}`}>
              <span className={styles.icon}><ServiceIcon kind={service.kind} /></span>
              <strong>{service.name}</strong><small>{service.detail}</small>
            </Link>
          </div>
        </div>)}
      </div>
      <span className={styles.coordinate} aria-hidden="true">01 — 04 / IN SYNC</span>
    </div>
    <div className={styles.caption}>
      <p>{en ? "One partner. A connected digital ecosystem." : "Satu partner. Ekosistem digital yang terhubung."}</p>
      <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={en ? (paused ? "Resume ecosystem animation" : "Pause ecosystem animation") : (paused ? "Lanjutkan animasi ekosistem" : "Jeda animasi ekosistem")}>
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{en ? (paused ? "Resume" : "Pause") : (paused ? "Lanjutkan" : "Jeda")}
      </button>
    </div>
  </div>;
}
