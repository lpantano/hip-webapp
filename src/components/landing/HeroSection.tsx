import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import MailingListSignup from "./MailingListSignup";

const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-10 md:pt-32 md:pb-8 flex items-center justify-center bg-hero-gradient">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight m-2 p-2">
                The Health Integrity Project
              </h1>
              <div className="w-full flex justify-end">
                <span className="text-sm sm:text-base md:text-xl text-primary">Women Edition</span>
              </div>
            </div>

          </div>
          <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 ">
            evidence-based insights for health claims
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 leading-relaxed">
          Building trust through transparency. Learn how to evaluate and trust health products
            with confidence through expert-backed scientific insights and community wisdom.
          </p>


        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 mt-8">
          <div className="flex-shrink-0 order-2 lg:order-1 relative">
            {/* <img
              src="/example_claim.png"
              alt="Example of a health claim review"
              className="max-w-sm lg:max-w-md xl:max-w-lg rounded-lg shadow-lg"
            /> */}
            {/* <Link to="/claims">
              <Button className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white shadow-lg">
                Browse All
              </Button>
            </Link> */}
          </div>
          <div className="order-1 lg:order-2">
            <MailingListSignup />

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
