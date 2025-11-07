import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What We Cover
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From health conditions to wellness products and digital apps - we evaluate everything that matters for women's health decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Health Issues */}
          <Card className="bg-card-gradient border-border/50  transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-primary text-2xl">Health Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Endometriosis</h4>
                    {/* <p className="text-muted-foreground text-sm">Tissue growing outside the uterus, affecting up to 10% of reproductive-age women.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Perimenopause</h4>
                    {/* <p className="text-muted-foreground text-sm">Transitional period with significant hormonal changes affecting quality of life.</p> */}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Hormone Treatment</h4>
                    {/* <p className="text-muted-foreground text-sm">Evidence-based hormonal therapies for various women's health conditions.</p> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness */}
          <Card className="bg-card-gradient border-border/50 transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-accent text-2xl">Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Creatine</h4>
                    {/* <p className="text-muted-foreground text-sm">Well-researched supplement supporting muscle strength and cognitive function in women.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Strength Training</h4>
                    {/* <p className="text-muted-foreground text-sm">Resistance exercise with proven benefits for bone health and metabolic function.</p> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mental Health */}
          <Card className="bg-card-gradient border-border/50  transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-primary text-2xl">Mental Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">ADHD</h4>
                    {/* <p className="text-muted-foreground text-sm">Attention-deficit/hyperactivity disorder often underdiagnosed in women due to presentation differences.</p> */}
                  </div>

                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Anxiety</h4>
                    {/* <p className="text-muted-foreground text-sm">Anxiety disorders affect women at twice the rate of men, with unique triggers and manifestations.</p> */}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Depression</h4>
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
