import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Health Issues */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-primary text-2xl">Health Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Endometriosis</h4>
                    <p className="text-muted-foreground text-sm">Tissue growing outside the uterus, affecting up to 10% of reproductive-age women.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Health Issues</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Study Size Analysis</h4>
                          <p className="text-sm text-muted-foreground">We examine study participant numbers across multiple research papers, ensuring adequate statistical power for reliable conclusions about women's health conditions.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Population Diversity</h4>
                          <p className="text-sm text-muted-foreground">Assessment of demographic representation including age groups, ethnicities, and geographic locations to ensure findings apply broadly to women's experiences.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Research Consensus</h4>
                          <p className="text-sm text-muted-foreground">Review of agreement across multiple independent studies and meta-analyses to identify consistent patterns in health condition research.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Clinical Application</h4>
                          <p className="text-sm text-muted-foreground">Validation of how research findings translate to real-world treatment outcomes and patient experiences in clinical settings.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Perimenopause</h4>
                    <p className="text-muted-foreground text-sm">Transitional period with significant hormonal changes affecting quality of life.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Health Issues</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Study Size Analysis</h4>
                          <p className="text-sm text-muted-foreground">We examine study participant numbers across multiple research papers, ensuring adequate statistical power for reliable conclusions about women's health conditions.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Population Diversity</h4>
                          <p className="text-sm text-muted-foreground">Assessment of demographic representation including age groups, ethnicities, and geographic locations to ensure findings apply broadly to women's experiences.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Research Consensus</h4>
                          <p className="text-sm text-muted-foreground">Review of agreement across multiple independent studies and meta-analyses to identify consistent patterns in health condition research.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Clinical Application</h4>
                          <p className="text-sm text-muted-foreground">Validation of how research findings translate to real-world treatment outcomes and patient experiences in clinical settings.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Hormone Treatment</h4>
                    <p className="text-muted-foreground text-sm">Evidence-based hormonal therapies for various women's health conditions.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Health Issues</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Study Size Analysis</h4>
                          <p className="text-sm text-muted-foreground">We examine study participant numbers across multiple research papers, ensuring adequate statistical power for reliable conclusions about women's health conditions.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Population Diversity</h4>
                          <p className="text-sm text-muted-foreground">Assessment of demographic representation including age groups, ethnicities, and geographic locations to ensure findings apply broadly to women's experiences.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Research Consensus</h4>
                          <p className="text-sm text-muted-foreground">Review of agreement across multiple independent studies and meta-analyses to identify consistent patterns in health condition research.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Clinical Application</h4>
                          <p className="text-sm text-muted-foreground">Validation of how research findings translate to real-world treatment outcomes and patient experiences in clinical settings.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-accent text-2xl">Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Creatine</h4>
                    <p className="text-muted-foreground text-sm">Well-researched supplement supporting muscle strength and cognitive function in women.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Wellness Products</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for supplements and wellness interventions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Efficacy Studies</h4>
                          <p className="text-sm text-muted-foreground">Analysis of randomized controlled trials measuring actual outcomes in women, not just general population studies adapted to women.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Safety Profile</h4>
                          <p className="text-sm text-muted-foreground">Comprehensive review of side effects, interactions, and long-term safety data specifically in female populations across different life stages.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Dosage Optimization</h4>
                          <p className="text-sm text-muted-foreground">Evidence-based recommendations for optimal dosing protocols that account for women's unique physiological factors and hormonal variations.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Quality Standards</h4>
                          <p className="text-sm text-muted-foreground">Assessment of product manufacturing standards, third-party testing, and regulatory compliance to ensure safety and potency.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Strength Training</h4>
                    <p className="text-muted-foreground text-sm">Resistance exercise with proven benefits for bone health and metabolic function.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Wellness Products</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for supplements and wellness interventions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Efficacy Studies</h4>
                          <p className="text-sm text-muted-foreground">Analysis of randomized controlled trials measuring actual outcomes in women, not just general population studies adapted to women.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Safety Profile</h4>
                          <p className="text-sm text-muted-foreground">Comprehensive review of side effects, interactions, and long-term safety data specifically in female populations across different life stages.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Dosage Optimization</h4>
                          <p className="text-sm text-muted-foreground">Evidence-based recommendations for optimal dosing protocols that account for women's unique physiological factors and hormonal variations.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Quality Standards</h4>
                          <p className="text-sm text-muted-foreground">Assessment of product manufacturing standards, third-party testing, and regulatory compliance to ensure safety and potency.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mental Health */}
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300 relative">
            <CardHeader>
              <CardTitle className="text-primary text-2xl">Mental Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">ADHD</h4>
                    <p className="text-muted-foreground text-sm">Attention-deficit/hyperactivity disorder often underdiagnosed in women due to presentation differences.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Mental Health Conditions</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for mental health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Gender-Specific Research</h4>
                          <p className="text-sm text-muted-foreground">Analysis of studies that examine how mental health conditions present differently in women, including hormonal influences and diagnostic criteria.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Treatment Efficacy</h4>
                          <p className="text-sm text-muted-foreground">Review of therapeutic approaches and medications specifically tested in female populations across different life stages and hormonal states.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Comorbidity Patterns</h4>
                          <p className="text-sm text-muted-foreground">Examination of how mental health conditions intersect with women's physical health, reproductive health, and social factors.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Access & Barriers</h4>
                          <p className="text-sm text-muted-foreground">Assessment of healthcare access, stigma, and systemic barriers that affect women's mental health diagnosis and treatment.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Anxiety</h4>
                    <p className="text-muted-foreground text-sm">Anxiety disorders affect women at twice the rate of men, with unique triggers and manifestations.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Mental Health Conditions</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for mental health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Gender-Specific Research</h4>
                          <p className="text-sm text-muted-foreground">Analysis of studies that examine how mental health conditions present differently in women, including hormonal influences and diagnostic criteria.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Treatment Efficacy</h4>
                          <p className="text-sm text-muted-foreground">Review of therapeutic approaches and medications specifically tested in female populations across different life stages and hormonal states.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Comorbidity Patterns</h4>
                          <p className="text-sm text-muted-foreground">Examination of how mental health conditions intersect with women's physical health, reproductive health, and social factors.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Access & Barriers</h4>
                          <p className="text-sm text-muted-foreground">Assessment of healthcare access, stigma, and systemic barriers that affect women's mental health diagnosis and treatment.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Depression</h4>
                    <p className="text-muted-foreground text-sm">Major depressive disorder with strong links to hormonal changes and reproductive health in women.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>How We Evaluate Mental Health Conditions</DialogTitle>
                        <DialogDescription>
                          Our evaluation process for mental health conditions affecting women
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Gender-Specific Research</h4>
                          <p className="text-sm text-muted-foreground">Analysis of studies that examine how mental health conditions present differently in women, including hormonal influences and diagnostic criteria.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Treatment Efficacy</h4>
                          <p className="text-sm text-muted-foreground">Review of therapeutic approaches and medications specifically tested in female populations across different life stages and hormonal states.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Comorbidity Patterns</h4>
                          <p className="text-sm text-muted-foreground">Examination of how mental health conditions intersect with women's physical health, reproductive health, and social factors.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Access & Barriers</h4>
                          <p className="text-sm text-muted-foreground">Assessment of healthcare access, stigma, and systemic barriers that affect women's mental health diagnosis and treatment.</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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