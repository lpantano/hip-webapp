import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const SampleSizeCard = () => {
  const [sampleSizeOpen, setSampleSizeOpen] = React.useState(false);

  return (
    <Dialog open={sampleSizeOpen} onOpenChange={setSampleSizeOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-xl">Sample Size</div>
          </CardHeader>
          <CardContent className="text-center">
            <div>Why study size matters</div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-primary" />
            Why Study Size Matters in Research
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how the number of study participants affects research reliability
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What is Sample Size?</h3>
            <p className="text-muted-foreground">
              Sample size refers to the number of participants included in a research study. Larger sample sizes generally provide more reliable and generalizable results, while smaller samples may be less representative of the broader population.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Why Sample Size Matters</h3>
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Large Sample Size (1000+ participants)</h4>
                <p className="text-sm text-muted-foreground">
                  More likely to detect true effects, better representation of the population, and more reliable statistical conclusions.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">~ Medium Sample Size (100-999 participants)</h4>
                <p className="text-sm text-muted-foreground">
                  Moderate reliability, may miss smaller but important effects, reasonable for exploratory studies.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">✗ Small Sample Size (&lt;100 participants)</h4>
                <p className="text-sm text-muted-foreground">
                  Higher risk of unreliable results, may not represent the broader population, prone to false positives or negatives.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Real-World Examples</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Strong Evidence: Women's Health Initiative</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This landmark study included over 161,000 postmenopausal women to study hormone replacement therapy effects. The large sample size allowed researchers to detect both benefits and risks with high confidence.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Weak Evidence: Small Supplement Studies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Many supplement studies include only 20-50 participants. While they may show promising results, the small sample size makes it difficult to know if the benefits would apply to the general population.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What to Look For</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Studies with hundreds or thousands of participants are generally more reliable</li>
              <li>• Be cautious of dramatic claims based on very small studies</li>
              <li>• Look for replication - multiple studies with consistent results</li>
              <li>• Consider whether the sample size is appropriate for the research question</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SampleSizeCard;
