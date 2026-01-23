import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-10 md:pt-32 md:pb-8 flex items-center justify-center bg-hero-gradient">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-end">
                <span className="text-sm sm:text-base md:text-xl  text-muted font-bold m-3 sm:m-2">Women Edition</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight m-1 p-2">
                The Health Integrity Project
              </h1>

            </div>

          </div>
          <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 ">
            Expert-Reviewed Evidence for <a href="/claims" className="inline-flex items-center mt-4 text-accent-secondary underline font-bold hover:text-primary transition-colors">
              Health Claims <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" />
          </a>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 leading-relaxed">
          Building trust through transparency. Learn how to evaluate and trust health information
            with confidence through expert-backed scientific insights and community wisdom.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
