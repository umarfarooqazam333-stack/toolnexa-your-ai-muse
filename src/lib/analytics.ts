const MEASUREMENT_ID = "G-BW49KEEJFR";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    send_to: MEASUREMENT_ID,
  });
}

export function useAnalyticsScript() {
  if (typeof window === "undefined") return;
  if (document.querySelector(`script[src*="${MEASUREMENT_ID}"]`)) {
    initAnalytics();
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.onload = () => initAnalytics();
  document.head.appendChild(script);
}
