import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PopulationDiversityCard = () => {
  const [populationOpen, setPopulationOpen] = React.useState(false);

  return (
    <Dialog open={populationOpen} onOpenChange={setPopulationOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Population Representation</CardTitle>
            <CardDescription>
              Why diverse participants matter
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
            <Globe className="w-6 h-6 text-primary" />
            Why Population Representation Matters
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how bias in study populations can invalidate research results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What is Population Representation?</h3>
            <p className="text-muted-foreground">
              Population representation refers to how well the study participants reflect the broader group the research claims to help. Good representation includes diversity in age, race, ethnicity, socioeconomic status, geography, and health conditions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Why Representation Matters</h3>
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Diverse, Representative Sample</h4>
                <p className="text-sm text-muted-foreground">
                  Results are more likely to apply to different groups of people, accounting for genetic, cultural, and environmental differences.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">~ Moderately Representative</h4>
                <p className="text-sm text-muted-foreground">
                  Some diversity but may miss important subgroups, limiting generalizability to certain populations.
                </p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">✗ Narrow, Unrepresentative Sample</h4>
                <p className="text-sm text-muted-foreground">
                  Results may not apply to most people, potentially leading to ineffective or harmful recommendations for underrepresented groups.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Real-World Examples</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Good Representation: VITAL Study</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This vitamin D and omega-3 study included 25,871 participants with 20% African Americans, balanced gender representation, and participants from across the U.S., making results more applicable to diverse populations.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Poor Representation: Historical Heart Disease Research</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For decades, heart disease research focused primarily on middle-aged white men. This led to missed diagnoses in women and minorities, whose symptoms and risk factors can differ significantly.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Common Representation Problems</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Age bias:</strong> Only studying young adults when the condition affects older people</li>
              <li>• <strong>Gender bias:</strong> Male-only studies applied to women without validation</li>
              <li>• <strong>Racial/ethnic bias:</strong> Predominantly white participants when genetics vary by ancestry</li>
              <li>• <strong>Geographic bias:</strong> Only urban or only Western populations</li>
              <li>• <strong>Socioeconomic bias:</strong> Only educated, affluent participants</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What to Look For</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Check if the study population matches the group you belong to</li>
              <li>• Look for diversity in age, gender, race, and health status</li>
              <li>• Be cautious of animal studies or single-demographic human studies</li>
              <li>• Prefer studies that explicitly address population diversity</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopulationDiversityCard;
