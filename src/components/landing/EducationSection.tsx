import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, CheckCircle, BookOpen, BarChart3 } from 'lucide-react';

const EducationSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Understanding Research Quality
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn why certain factors make research more trustworthy when evaluating health claims
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Sample Size Card - Interactive */}
          <Dialog open={open} onOpenChange={setOpen}>
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
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Users className="w-6 h-6 text-primary" />
                  Why Sample Size Matters in Research
                </DialogTitle>
                <DialogDescription className="text-base">
                  Understanding how the number of study participants affects research reliability
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Visual Example */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
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
                        <CheckCircle className="w-5 h-5" />
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
                        <AlertTriangle className="w-5 h-5" />
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
                    <TrendingUp className="w-5 h-5" />
                    Sample Size Guidelines for Women's Health
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-2">
                        Small (10-50)
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Preliminary findings only. Results should be confirmed in larger studies.
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mb-2">
                        Medium (100-500)
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        More reliable, but may still miss important effects or subgroups.
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">
                        Large (1000+)
                      </Badge>
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

          {/* Other educational cards (non-interactive for now) */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Population Diversity</CardTitle>
              <CardDescription>
                Why diverse participants matter
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="ghost" disabled className="text-muted-foreground">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
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
              <Button variant="ghost" disabled className="text-muted-foreground">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Evidence Quality</CardTitle>
              <CardDescription>
                What makes evidence strong
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="ghost" disabled className="text-muted-foreground">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
