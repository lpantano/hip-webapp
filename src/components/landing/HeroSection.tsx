import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            What Data Says
            <span className="text-accent"> - Women Edition</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Evaluate the quality of health and wellness products through rigorous scientific review. 
            Join experts and scientists in creating transparency for women's health decisions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { title: "Sample Size", desc: "Evaluate study participant numbers" },
            { title: "Population", desc: "Assess representation diversity" },
            { title: "Consensus", desc: "Review research agreement" },
            { title: "Application", desc: "Validate product claims" }
          ].map((item, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-white hover:bg-white/20 transition-all duration-300">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-white/80 text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;