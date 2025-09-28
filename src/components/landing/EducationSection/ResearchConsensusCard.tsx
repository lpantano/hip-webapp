import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResearchConsensusCard = () => {
  const [consensusOpen, setConsensusOpen] = React.useState(false);

  return (
    <Dialog open={consensusOpen} onOpenChange={setConsensusOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-accent/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-xl">Research Consensus</CardTitle>
            <CardDescription>
              When multiple studies agree
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

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-accent" />
            Understanding Research Consensus
          </DialogTitle>
          <DialogDescription className="text-base">
            Why multiple independent studies reaching the same conclusion provides stronger evidence
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What is Research Consensus?</h3>
            <p className="text-muted-foreground">
              Research consensus occurs when multiple independent studies, conducted by different research teams using different methods, consistently find similar results. It's one of the strongest indicators that a scientific finding is reliable and actionable.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Levels of Consensus</h3>
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Strong Consensus</h4>
                <p className="text-sm text-muted-foreground">
                  Multiple high-quality studies from different research groups consistently show the same results. Meta-analyses and systematic reviews support the findings.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">~ Emerging Consensus</h4>
                <p className="text-sm text-muted-foreground">
                  Several studies suggest similar results, but some conflicting evidence exists or more research is needed in certain populations.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">✗ No Consensus / Conflicting Evidence</h4>
                <p className="text-sm text-muted-foreground">
                  Studies show mixed results, only one or few studies exist, or findings haven't been replicated by independent researchers.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Real-World Examples</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Strong Consensus: Folic Acid and Neural Tube Defects</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Dozens of studies across different countries consistently show that folic acid supplementation before and during early pregnancy reduces neural tube defects by 50-70%. This consensus led to mandatory food fortification in many countries.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium">Emerging Consensus: Intermittent Fasting</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Multiple studies suggest benefits for weight loss and metabolic health, but results vary by fasting method, duration, and individual factors. More long-term research is needed.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">No Consensus: High-Dose Vitamin C for Cancer</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Studies show conflicting results about vitamin C's effectiveness in cancer treatment. Some show benefits, others show no effect, making it impossible to draw reliable conclusions.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Why Consensus Matters</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Reduces chance of false positives:</strong> Unlikely that multiple independent teams would all make the same mistake</li>
              <li>• <strong>Accounts for different populations:</strong> Results hold across different groups and settings</li>
              <li>• <strong>Validates methods:</strong> Similar results despite different approaches increase confidence</li>
              <li>• <strong>Guides policy:</strong> Health recommendations are typically based on consensus, not single studies</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What to Look For</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Multiple studies showing similar results from different research groups</li>
              <li>• Meta-analyses or systematic reviews that combine multiple studies</li>
              <li>• Professional medical society recommendations based on evidence reviews</li>
              <li>• Be skeptical of claims based on single studies, especially if they contradict existing evidence</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Look for phrases like "systematic review," "meta-analysis," or "scientific consensus" when evaluating health claims. These indicate that researchers have looked at multiple studies together, not just cherry-picked favorable results.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchConsensusCard;
