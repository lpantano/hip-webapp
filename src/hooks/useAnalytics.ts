import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { useConsent } from "@/components/consent/ConsentProvider";

export function useAnalytics() {
  const location = useLocation();
  const { analytics } = useConsent();

  useEffect(() => {
    if (analytics !== "granted") return;
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [analytics, location.pathname, location.search]);
}
