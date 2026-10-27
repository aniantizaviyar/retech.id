"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./PublicMotion.module.css";

const cards = ".service-card,.project-card,.service-directory-card,.pricing-card,.principle-grid article,.service-outcomes article,.product-showcase,.product-feature-grid article,.product-plan-grid article,.subscription-principle-grid article,.hosting-grid article,[data-motion-card],[data-motion-content] article";
const headings = ".section-heading,.pricing-heading,.product-section-heading,.about-section-heading,[data-motion-heading]";
const details = ".faq-list details,.comparison-grid article,.support-price-list article,.pricing-note-grid article,.about-trust-grid article,.case-story>div";

/** Progressive enhancement only: content, forms and navigation never depend on motion. */
export function PublicMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>(".public-site");
    if (!root || typeof IntersectionObserver === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let stopMotion = () => {};

    const initialize = () => {
      stopMotion();
      if (reduced.matches) return;
      root.classList.add(styles.motionRoot);
      const cardElements = Array.from(root.querySelectorAll<HTMLElement>(cards));
      const timelines = Array.from(root.querySelectorAll<HTMLElement>(".process-list,.service-process ol,.product-workflow-grid,[data-motion-timeline],[data-motion-content] ol"));
      const steps = timelines.flatMap(list => Array.from(list.children).filter((child): child is HTMLElement => child instanceof HTMLElement));
      const targets = [...new Set([...cardElements, ...root.querySelectorAll<HTMLElement>(`${headings},${details}`), ...steps])];
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.dataset.motionReveal = "visible";
          observer.unobserve(element);
        }
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

      for (const element of targets) {
        const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
        element.style.setProperty("--motion-delay", `${Math.min(Math.max(siblings.indexOf(element), 0), 3) * 60}ms`);
        observer.observe(element);
      }
      for (const element of cardElements) element.dataset.motionSpotlight = "";
      for (const element of steps) element.dataset.motionStep = "";

      let activeCard: HTMLElement | null = null;
      let frame = 0;
      let x = 0;
      let y = 0;
      const clearPointer = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        if (!activeCard) return;
        delete activeCard.dataset.motionPointer;
        activeCard.style.removeProperty("--motion-x");
        activeCard.style.removeProperty("--motion-y");
        activeCard = null;
      };
      const movePointer = (event: PointerEvent) => {
        if (!finePointer.matches || event.pointerType === "touch") return;
        const card = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-motion-spotlight]") : null;
        if (!card || !root.contains(card)) { clearPointer(); return; }
        if (activeCard !== card) { clearPointer(); activeCard = card; }
        const rect = card.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!activeCard) return;
          activeCard.style.setProperty("--motion-x", `${x}px`);
          activeCard.style.setProperty("--motion-y", `${y}px`);
          activeCard.dataset.motionPointer = "";
        });
      };
      root.addEventListener("pointermove", movePointer, { passive: true });
      root.addEventListener("pointerleave", clearPointer);
      finePointer.addEventListener("change", clearPointer);
      stopMotion = () => {
        observer.disconnect();
        clearPointer();
        root.removeEventListener("pointermove", movePointer);
        root.removeEventListener("pointerleave", clearPointer);
        finePointer.removeEventListener("change", clearPointer);
        root.classList.remove(styles.motionRoot);
        for (const element of targets) {
          delete element.dataset.motionReveal;
          delete element.dataset.motionStep;
          delete element.dataset.motionSpotlight;
          element.style.removeProperty("--motion-delay");
        }
      };
    };
    initialize();
    reduced.addEventListener("change", initialize);
    return () => { reduced.removeEventListener("change", initialize); stopMotion(); };
  }, [pathname]);

  return <span ref={marker} hidden data-public-motion="progressive" />;
}
