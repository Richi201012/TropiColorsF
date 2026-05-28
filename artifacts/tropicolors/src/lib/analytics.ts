const GOOGLE_MEASUREMENT_ID = "G-L5VE3SDQYE";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __googleAnalyticsInitialized?: boolean;
  }
}

function initializeGoogleAnalytics() {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (window.__googleAnalyticsInitialized) {
    return;
  }

  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_MEASUREMENT_ID, { send_page_view: false });
  window.__googleAnalyticsInitialized = true;
}

export function trackPageView(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  initializeGoogleAnalytics();

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_path: path,
    page_location: window.location.href,
    send_to: GOOGLE_MEASUREMENT_ID,
  });
}
