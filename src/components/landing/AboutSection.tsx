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
            Most Affected Health Issues &
            <span className="text-primary"> Evidence-Based Treatments</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We focus on the health conditions that affect women most and the treatments with the strongest scientific evidence.
          </p>
        </div>

        {/* Most Affected Health Issues */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-muted-foreground">Most Affected Health Issues</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-xl">Endometriosis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  A condition where tissue similar to the lining of the uterus grows outside the uterus, affecting up to 10% of reproductive-age women.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Often misdiagnosed or delayed diagnosis</li>
                  <li>• Chronic pelvic pain and infertility</li>
                  <li>• Expert reviews on treatment options</li>
                  <li>• Research-backed management strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-accent text-xl">Perimenopause</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The transitional period before menopause, typically starting in the 40s, with significant hormonal changes affecting quality of life.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Irregular periods and mood changes</li>
                  <li>• Hot flashes and sleep disruption</li>
                  <li>• Evidence-based symptom management</li>
                  <li>• Expert-reviewed treatment protocols</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-xl">Heart Disease</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The leading cause of death in women, often presenting differently than in men and frequently underdiagnosed in female patients.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Different symptoms than men</li>
                  <li>• Hormonal influences on risk</li>
                  <li>• Prevention and early detection</li>
                  <li>• Women-specific research insights</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Evidence-Based Treatments */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 text-muted-foreground">Evidence-Based Treatments</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-accent text-xl">HRT (Hormone Replacement Therapy)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Hormone replacement therapy for menopause symptoms, with evolving research on benefits and risks for different women.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Symptom relief for menopause</li>
                  <li>• Individualized risk assessment</li>
                  <li>• Latest safety research</li>
                  <li>• Expert dosing recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-xl">Creatine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  A well-researched supplement that supports muscle strength, cognitive function, and may have unique benefits for women.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Muscle strength and power</li>
                  <li>• Cognitive performance benefits</li>
                  <li>• Hormonal cycle considerations</li>
                  <li>• Dosing protocols for women</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-accent text-xl">Strength Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Resistance exercise with proven benefits for bone health, metabolic function, and overall wellness in women across all ages.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Bone density preservation</li>
                  <li>• Metabolic health improvement</li>
                  <li>• Age-specific protocols</li>
                  <li>• Research-backed programs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;