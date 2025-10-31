import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import DevRoleSelector from "./components/dev/DevRoleSelector";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Team from "./pages/Team";
import Community from "./pages/Community";
import Claims from "./pages/Claims";
import Legal from "./pages/Legal";
import Roadmap from "./pages/Roadmap";
import FeatureRequests from "./pages/FeatureRequests";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/community" element={<Community />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/features" element={<FeatureRequests />} />
            {/* <Route path="/games" element={<Games />} /> */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DevRoleSelector />
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
