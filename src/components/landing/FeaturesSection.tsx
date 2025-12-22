import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
  return (
    <section className="py-6 sm:py-8 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            What We
              <span className="text-accent"> Cover</span>

          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            From health to wellness - we evaluate everything that matters for women's health decisions in this edition.
          </p>
          <a href="/claims" className="inline-flex items-center mt-4 text-black font-bold hover:text-primary transition-colors">
          <span className="mt-2 inline-block text-base md:text-lg">
            Browse all health claims <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" />
          </span>
          </a>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-w-4xl sm:max-w-4xl mx-auto justify-items-center place-items-center">
          {/* Health Issues */}
          <Card className="bg-card-gradient border-2 text-center transition-all duration-300 relative p-2 sm:p-3 w-full max-w-xs sm:max-w-sm">
            <CardHeader>
              <CardTitle className="text-primary text-lg sm:text-xl md:text-2xl">Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=hormone-health" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">Hormone Health <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Tissue growing outside the uterus, affecting up to 10% of reproductive-age women.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=perimenopause" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">Perimenopause <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Transitional period with significant hormonal changes affecting quality of life.</p> */}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=pregnancy" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">Pregnancy <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Evidence-based hormonal therapies for various women's health conditions.</p> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness */}
          <Card className="bg-card-gradient border-2 text-center transition-all duration-300 relative p-2 sm:p-3 w-full max-w-xs sm:max-w-sm">
            <CardHeader>
              <CardTitle className="text-accent text-lg sm:text-xl md:text-2xl">Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=supplements" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-accent transition-colors cursor-pointer">Supplements <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Well-researched supplement supporting muscle strength and cognitive function in women.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=fitness" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-accent transition-colors cursor-pointer">Fitness <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Resistance exercise with proven benefits for bone health and metabolic function.</p> */}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=nutrition" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-accent transition-colors cursor-pointer">Nutrition <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Resistance exercise with proven benefits for bone health and metabolic function.</p> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mental Health */}
          <Card className="bg-card-gradient border-2 text-center transition-all duration-300 relative p-2 sm:p-3 w-full max-w-xs sm:max-w-sm">
            <CardHeader>
              <CardTitle className="text-primary text-lg sm:text-xl md:text-2xl">Mind</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=adhd" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">ADHD <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Attention-deficit/hyperactivity disorder often underdiagnosed in women due to presentation differences.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=anxiety" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">Anxiety <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Anxiety disorders affect women at twice the rate of men, with unique triggers and manifestations.</p> */}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to="/claims?label=depression" className="block">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors cursor-pointer">Depression <ArrowRight className="inline-block w-4 h-4 ml-1 mb-0.5" /></h4>
                    </Link>
                    {/* <p className="text-muted-foreground text-sm">Major depressive disorder with strong links to hormonal changes and reproductive health in women.</p> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
