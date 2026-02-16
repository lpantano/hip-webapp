import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/components/auth/AuthProvider";
import DevRoleSelector from "./components/dev/DevRoleSelector";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Team from "./pages/Team";
import Community from "./pages/Community";
import Claims from "./pages/Claims";
import ClaimDetail from "./pages/ClaimDetail";
import Legal from "./pages/Legal";
import Roadmap from "./pages/Roadmap";
import FeatureRequests from "./pages/FeatureRequests";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
// import Games from "./pages/Games";
import NotFound from "./pages/NotFound";
import ResearchWorkflow from "./pages/ResearchWorkflow";
import Footer from "./components/layout/Footer";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";

// Lazy load evidence page for code splitting
const ClaimEvidence = lazy(() => import('./pages/ClaimEvidence'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (previously cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Retry failed requests once
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Claims />} />
              <Route path="/project" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/community" element={<Community />} />
              <Route path="/claims/:id" element={<ClaimDetail />} />
              <Route path="/claims/:id/evidence" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ClaimEvidence /></Suspense>} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/features" element={<FeatureRequests />} />
              {/* <Route path="/games" element={<Games />} /> */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workflow" element={<ResearchWorkflow />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <DevRoleSelector />
            <PWAInstallPrompt floating />
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
