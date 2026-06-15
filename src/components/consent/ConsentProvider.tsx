import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { grantAnalyticsConsent, denyAnalyticsConsent, isAnalyticsConfigured } from "@/lib/analytics";

const STORAGE_KEY = "hip-consent-v1";

type ConsentChoice = "granted" | "denied";

interface StoredConsent {
  analytics: ConsentChoice;
  timestamp: string;
}

interface ConsentContextValue {
  analytics: ConsentChoice | null;
  hasChosen: boolean;
  showBanner: boolean;
  setConsent: (choice: ConsentChoice) => void;
  openSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.analytics !== "granted" && parsed.analytics !== "denied") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<ConsentChoice | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setAnalytics(stored.analytics);
      if (stored.analytics === "granted") {
        grantAnalyticsConsent();
      }
    } else if (isAnalyticsConfigured()) {
      setShowBanner(true);
    }
  }, []);

  const setConsent = useCallback((choice: ConsentChoice) => {
    const payload: StoredConsent = { analytics: choice, timestamp: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage blocked — still update runtime state
    }
    setAnalytics(choice);
    setShowBanner(false);
    if (choice === "granted") {
      grantAnalyticsConsent();
    } else {
      denyAnalyticsConsent();
    }
  }, []);

  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({ analytics, hasChosen: analytics !== null, showBanner, setConsent, openSettings }),
    [analytics, showBanner, setConsent, openSettings]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
