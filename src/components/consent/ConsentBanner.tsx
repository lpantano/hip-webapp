import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useConsent } from "./ConsentProvider";

const ConsentBanner = () => {
  const { showBanner, setConsent } = useConsent();

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
    >
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="text-sm text-foreground/90 max-w-3xl">
          <p>
            We use a small number of analytics cookies (Google Analytics) to count visits and see which pages
            are popular. No advertising, no cross-site tracking. See our{" "}
            <Link to="/legal" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
            Reject
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
