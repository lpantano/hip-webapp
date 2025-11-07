import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Check, X } from 'lucide-react';

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
            <CardTitle className="text-xl">Study Size</CardTitle>
            <CardDescription className="text-base font-medium">
              Large studies lead to lasting truths
            </CardDescription>
          </CardHeader>
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
          <br />
          <img
          src="/images/holding_hands.png"
          alt="Illustration showing effect size and sample size comparison"
          className="w-full max-w-3xl mx-auto mt-4 rounded-lg shadow-sm object-cover"
            />
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              When a study is conducted with too few participants or samples, the results can be unreliable—either missing real effects (a false negative) or overstating weak ones (a false positive). Larger sample sizes increase statistical power, making it easier to detect genuine patterns and relationships rather than random noise. A sufficiently large sample also helps account for natural variability within populations, ensuring that the findings are more generalizable to real-world conditions.
            </p>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Large Sample Size Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Generates high confidence results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Allows for better population representation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Reduces random chance effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Detection of smaller but real effects</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  {/* <AlertTriangle className="w-5 h-5" /> */}
                  Small Sample Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Results may be found due to chance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Evidence may not apply to everyone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Can miss small but important effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Higher risk of false conclusions</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real World Example: large */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold m-0">The Women's Health Inititiative (WHI)</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium">This was a massive set of clinical trials and observational studies in the U.S., enrolling over 160,000 women. Large study, with increased statistical power.</div>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
                  <li>Detection of modest effects of hormone replacement therapy (HRT), diet, and supplements on health outcomes.</li>
                  <li>Results revealed important risks of HRT (like increased breast cancer and cardiovascular disease) that smaller earlier studies had missed.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Real World Example: small (duplicated formatting with red X) */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
                    <X className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold m-0">The Andrew Wakefield MMR–Autism Study</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">This now-retracted study claimed a link between the measles, mumps, and rubella (MMR) vaccine and autism.</div>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
                      <li>Sample size was only 12 children.</li>
                      <li>No real statistical power and could not reliably detect population-level effects.</li>
                      <li>Later proven false in much larger studies.</li>
                    </ul>

                </div>
              </div>
            </div>
          </div>

          {/* How we score study size */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <DialogTitle className="text-2xl m-0">How do we score Study Size?</DialogTitle>
              <img
                src="/images/score-meter.png"
                alt="Study size scoring meter"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain mt-4 sm:mt-0 ml-auto"
                loading="lazy"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              The Health Integrity Project limits study size scoring to human studies (see Evaluation Workflow). The number of samples required is highly dependent on the type of study being performed. Below we provide the criteria and the associated labels when evaluating study size.
            </div>
          </div>

        {/* Scoring guidelines */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-black-200 dark:border-black-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-black-700 dark:text-black-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Single study analyses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc list-outside pl-6 space-y-2 text-sm text-black dark:text-white">
                  <li>&lt; 100 → Limited Tested in Humans (First Human Tests).</li>
                  <li>&gt; 100 → Tested in Humans</li>
                  <li>&gt; 500,000 → Widely tested in humans</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-black-200 dark:border-black-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-black-700 dark:text-black-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Meta-analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc list-outside pl-6 space-y-2 text-sm text-black dark:text-white">
                  <li> If &lt; 10 studies; and samples &lt; 500,000  → Widely Tested in Humans </li>
                  <li>&gt; 2 studies, any number of samples per study → Tested in Humans</li>
                </ul>
              </CardContent>
            </Card>
          </div>
       

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SampleSizeCard;
