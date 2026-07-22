"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    clarity?: (command: string, value: string) => void;
  }
}

export function trackSiteEvent(event: string, parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
  window.clarity?.("event", event);
}

export function AnalyticsEvents() {
  useEffect(() => {
    function trackClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const element = target?.closest<HTMLElement>("[data-analytics], a[href]");
      if (!element) return;

      const explicitEvent = element.dataset.analytics;
      const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
      let eventName = explicitEvent;

      if (!eventName && href.startsWith("mailto:")) eventName = "email_click";
      if (!eventName && href.startsWith("tel:")) eventName = "phone_click";
      if (!eventName && /wa\.me|whatsapp/i.test(href)) eventName = "whatsapp_click";
      if (!eventName) return;

      trackSiteEvent(eventName, {
        link_url: href || undefined,
        link_text: element.textContent?.trim().slice(0, 120) || undefined,
        page_path: window.location.pathname,
        event_source: element.dataset.analyticsSource || undefined,
      });
    }

    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, []);

  return null;
}
