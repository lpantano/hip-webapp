import HeroSection from "@/components/landing/HeroSection";
import PurposeSection from "@/components/landing/PurposeSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SciencePathSection from '@/components/landing/SciencePathSection';
import EducationSection from "@/components/landing/EducationSection";
import JoinSection from "@/components/landing/JoinSection";
import Header from "@/components/layout/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <PurposeSection />
      <FeaturesSection />
      <SciencePathSection />
      <EducationSection/>
      <JoinSection />
    </div>
  );
};

export default Index;
