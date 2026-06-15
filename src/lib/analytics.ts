declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let scriptLoaded = false;

function ensureGtagShim() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
}

function loadGtagScript() {
  if (scriptLoaded || !GA_ID) return;
  ensureGtagShim();
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  scriptLoaded = true;
}

export function grantAnalyticsConsent() {
  if (!GA_ID) return;
  ensureGtagShim();
  window.gtag("consent", "update", { analytics_storage: "granted" });
  loadGtagScript();
}

export function denyAnalyticsConsent() {
  ensureGtagShim();
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

export function trackPageView(path: string, title?: string) {
  if (!GA_ID || !scriptLoaded) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.origin + path,
  });
}

export const isAnalyticsConfigured = () => Boolean(GA_ID);
