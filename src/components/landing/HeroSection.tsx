import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import MailingListSignup from "./MailingListSignup";

const HeroSection = () => {
  return (
    <section className="relative pt-20 pb-10 md:pt-32 md:pb-8 flex items-center justify-center bg-hero-gradient">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            ClaimWell
            <span style={{ color: "hsl(210, 50%, 43%)" }}> - Women Edition</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Building trust through transparency. Learn how to evaluate and trust health products
            with confidence through expert-backed scientific insights and community wisdom.
          </p>
        </div>
        <MailingListSignup />
      </div>
    </section>
  );
};

export default HeroSection;