import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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
            <CardTitle className="text-xl">Sample Size</CardTitle>
            <CardDescription>
              Why the number of participants matters
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button
              type="button"
              className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 bg-transparent border-none cursor-pointer flex items-center justify-center mx-auto"
              tabIndex={-1}
            >
              {/* You can use an icon here if desired, e.g. <BookOpen className="w-4 h-4 mr-2" /> */}
              Learn More
            </button>
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
          {/* Visual Example */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {/* BarChart3 icon can be imported if needed */}
              Visual Example: Coin Flip Study
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-500 mb-2">Small Study</div>
                <div className="text-sm text-muted-foreground mb-2">10 participants</div>
                <div className="text-lg">7 heads, 3 tails</div>
                <div className="text-sm text-red-600 mt-2">70% heads - Seems biased!</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500 mb-2">Medium Study</div>
                <div className="text-sm text-muted-foreground mb-2">100 participants</div>
                <div className="text-lg">52 heads, 48 tails</div>
                <div className="text-sm text-yellow-600 mt-2">52% heads - Getting closer</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-500 mb-2">Large Study</div>
                <div className="text-sm text-muted-foreground mb-2">1,000 participants</div>
                <div className="text-lg">501 heads, 499 tails</div>
                <div className="text-sm text-green-600 mt-2">50.1% heads - True result!</div>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Large Sample Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>More reliable results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Better represents population</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Reduces random chance effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Detects smaller but real effects</span>
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
                  <span>Results may be due to chance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>May not apply to everyone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Can miss important effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Higher risk of false conclusions</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines */}
          <div className="bg-primary/5 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {/* <TrendingUp className="w-5 h-5" /> */}
              Study Size Guidelines for Women's Health
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-2 inline-block rounded px-2 py-1">Small (10-50)</span>
                <div className="text-sm text-muted-foreground">
                  Preliminary findings only. Results should be confirmed in larger studies.
                </div>
              </div>
              <div className="text-center">
                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mb-2 inline-block rounded px-2 py-1">Medium (100-500)</span>
                <div className="text-sm text-muted-foreground">
                  More reliable, but may still miss important effects or subgroups.
                </div>
              </div>
              <div className="text-center">
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2 inline-block rounded px-2 py-1">Large (1000+)</span>
                <div className="text-sm text-muted-foreground">
                  Most reliable for detecting real effects and applying to broader populations.
                </div>
              </div>
            </div>
          </div>

          {/* Real World Example */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Real-World Example: Turmeric for Joint Pain</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Small study (45 women):</div>
                  <div className="text-muted-foreground">"Turmeric reduced joint pain in 80% of participants"</div>
                  <div className="text-red-600 text-xs mt-1">⚠️ Could be chance - only 36 women showed improvement</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Large study (1,200 women):</div>
                  <div className="text-muted-foreground">"Turmeric reduced joint pain in 65% of participants"</div>
                  <div className="text-green-600 text-xs mt-1">✓ More reliable - 780 women showed improvement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SampleSizeCard;
