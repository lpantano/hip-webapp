import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import JoinSection from "@/components/landing/JoinSection";
import Header from "@/components/layout/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <JoinSection />
    </div>
  );
};

export default Index;
