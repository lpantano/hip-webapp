import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Focus Areas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Our <span className="text-primary">Focus Areas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We evaluate the most critical areas affecting women's health through rigorous scientific review.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Health Issues */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary text-2xl text-center">Health Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Endometriosis</h4>
                  <p className="text-muted-foreground text-sm">Tissue growing outside the uterus, affecting up to 10% of reproductive-age women.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Perimenopause</h4>
                  <p className="text-muted-foreground text-sm">Transitional period with significant hormonal changes affecting quality of life.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Hormone Treatment</h4>
                  <p className="text-muted-foreground text-sm">Evidence-based hormonal therapies for various women's health conditions.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-accent text-2xl text-center">Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Creatine</h4>
                  <p className="text-muted-foreground text-sm">Well-researched supplement supporting muscle strength and cognitive function in women.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Strength Training</h4>
                  <p className="text-muted-foreground text-sm">Resistance exercise with proven benefits for bone health and metabolic function.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apps */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary text-2xl text-center">Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Health Data Usage</h4>
                  <p className="text-muted-foreground text-sm">Evaluating how health apps collect, use, and protect women's personal health information.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Real Impact</h4>
                  <p className="text-muted-foreground text-sm">Assessing whether health apps deliver measurable improvements to women's health outcomes.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;