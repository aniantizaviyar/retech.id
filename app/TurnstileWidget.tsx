"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  onUnavailable: () => void;
  locale?: "id" | "en";
  action?: "lead_submit" | "admin_login" | "assistant_chat";
  responsive?: boolean;
};

const SCRIPT_ID = "cloudflare-turnstile-script";
const TEST_SITE_KEY = "1x00000000000000000000AA";

export function TurnstileWidget({ onVerify, onUnavailable, locale = "id", action = "lead_submit", responsive = false }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onUnavailableRef = useRef(onUnavailable);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV === "development" ? TEST_SITE_KEY : "");

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable, onVerify]);

  useEffect(() => {
    if (!siteKey) {
      onUnavailableRef.current();
      return;
    }

    let cancelled = false;
    let renderedSize = "";
    const desiredSize = () => responsive && (containerRef.current?.clientWidth ?? 300) < 300 ? "compact" : "flexible";

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      renderedSize = desiredSize();
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: "dark",
        size: renderedSize,
        language: locale,
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onVerifyRef.current(""),
        "error-callback": () => onUnavailableRef.current(),
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderWidget, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget, { once: true });
      script.addEventListener("error", () => onUnavailableRef.current(), { once: true });
      document.head.appendChild(script);
    }

    const observer = responsive ? new ResizeObserver(() => {
      if (!widgetIdRef.current || !window.turnstile || renderedSize === desiredSize()) return;
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      onVerifyRef.current("");
      renderWidget();
    }) : null;
    if (containerRef.current) observer?.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (existingScript) existingScript.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [action, locale, siteKey, responsive]);

  return <div className="turnstile-shell" ref={containerRef} role="group" aria-label={locale === "en" ? "Security verification" : "Verifikasi keamanan"} />;
}
