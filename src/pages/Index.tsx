import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import EducationSection from "@/components/landing/EducationSection"; 
import JoinSection from "@/components/landing/JoinSection";
import Header from "@/components/layout/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <EducationSection/>
      <JoinSection />
    </div>
  );
};

export default Index;
