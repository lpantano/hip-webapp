import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EvidenceQualityCard = () => {
  const [evidenceQualityOpen, setEvidenceQualityOpen] = React.useState(false);

  return (
    <Dialog open={evidenceQualityOpen} onOpenChange={setEvidenceQualityOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-accent/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-xl">Evidence Quality</CardTitle>
            <CardDescription>
              How conclusions align with claims
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="ghost" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="w-6 h-6 text-accent" />
            Evidence Quality: Do Conclusions Match Claims?
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how to evaluate whether research conclusions actually support the health claims being made
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What is Evidence Quality?</h3>
            <p className="text-muted-foreground">
              Evidence quality refers to how well a study's actual findings support the health claims being made about it. High-quality evidence means the study design, execution, and analysis directly support the conclusions, while low-quality evidence involves inappropriate extrapolation or methodological flaws.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Hierarchy of Evidence Quality</h3>
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ High Quality: Randomized Controlled Trials (RCTs)</h4>
                <p className="text-sm text-muted-foreground">
                  Participants randomly assigned to treatment or control groups. Can establish cause-and-effect relationships. Considered the gold standard for medical research.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">~ Medium Quality: Observational Studies</h4>
                <p className="text-sm text-muted-foreground">
                  Researchers observe participants without intervention. Can show associations but not causation. Includes cohort studies, case-control studies, and cross-sectional studies.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">✗ Low Quality: Animal Studies, Cell Studies, Case Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Results may not translate to humans. Useful for early research but cannot support definitive health recommendations for people.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Common Quality Problems</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Inappropriate Extrapolation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Example:</strong> A study shows turmeric reduces inflammation in mice with arthritis. The claim becomes "turmeric cures arthritis in humans." The evidence doesn't support the human health claim.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Correlation vs. Causation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Example:</strong> An observational study finds people who take vitamin D have fewer heart attacks. The claim becomes "vitamin D prevents heart attacks." The study only shows association, not causation.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Cherry-Picking Results</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Example:</strong> A study tests 20 different outcomes but only one shows a positive result. Marketing focuses on that one positive finding while ignoring the 19 negative results.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Real-World Examples</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">High Quality: Aspirin for Heart Attack Prevention</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Multiple large randomized controlled trials showed that low-dose aspirin reduces heart attacks in high-risk individuals. The evidence directly supports the medical recommendation.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium">Medium Quality: Mediterranean Diet and Longevity</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Large observational studies consistently link Mediterranean diet patterns with longer life, but it's hard to isolate diet from other lifestyle factors. Evidence is suggestive but not definitive.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Low Quality: "Superfood" Claims</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Many "superfood" claims are based on test-tube studies showing antioxidant activity. These don't prove the food provides health benefits when eaten by humans.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Red Flags in Evidence Quality</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Claims based solely on animal or laboratory studies</li>
              <li>• Confusing correlation with causation</li>
              <li>• Extrapolating far beyond what the study actually tested</li>
              <li>• Ignoring negative results or side effects</li>
              <li>• Using preliminary or pilot studies to make definitive claims</li>
              <li>• Misrepresenting statistical significance or effect sizes</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What to Look For</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Studies done in humans, not just animals or test tubes</li>
              <li>• Randomized controlled trials for treatment claims</li>
              <li>• Large sample sizes with diverse participants</li>
              <li>• Peer-reviewed publications in reputable journals</li>
              <li>• Conservative conclusions that match the actual findings</li>
              <li>• Acknowledgment of study limitations</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">⚠️ Important</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Be especially skeptical of dramatic health claims that seem too good to be true. Quality research typically shows modest, realistic benefits with acknowledgment of limitations and potential risks.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceQualityCard;
