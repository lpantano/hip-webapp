import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, BookOpen, Check, X } from 'lucide-react';
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
            <CardTitle className="text-xl">Population Diversity</CardTitle>
            <CardDescription className="text-base font-medium">
              Diverse data, stronger discoveries
            </CardDescription>
          </CardHeader>
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
          <br />
          <img
          src="/images/pop_diversity.png"
          alt="Illustration showing diverse group of people representing population diversity"
          className="w-full max-w-3xl mx-auto mt-4 rounded-lg shadow-sm object-cover"
            />
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold mb-3">What is Population Representation?</h3>
            <p className="text-muted-foreground">
              Population representation refers to the inclusion of participants with a wide range of characteristics—such as age, sex, race, ethnicity, geography, socioeconomic status, and health background. 
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Why does Representation Matter?</h3>
            <p className="text-muted-foreground">
              Ensuring diverse representation in a study’s population is essential for generating results that are <b>broadly applicable.</b> When certain groups are underrepresented, the findings may not accurately capture how an intervention, treatment, or condition affects different segments of the population. Inadequate representation can introduce bias, limit the generalizability of results, and ultimately undermine the validity and impact of the research.
            </p>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Good Representation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Participants ages span across relevant ranges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Balance of both men and women, when applicable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Ethnic diversity inclusive of multiple racial groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Geographic spread across locations</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  {/* <AlertTriangle className="w-5 h-5" /> */}
                  Limited Representation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Young adults recruited for arthirtis study</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Study group with only one female participant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Studies conducted primarily in Western populations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Only particpants with health insurance included</span>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Real World Example: Diverse */}
          <div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold m-0">Carolina Breast Cancer Study </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">A population-based, case-control cohort conducted in a 24-county region of North Carolina beginning in the 1990s. Deliberate oversampling of Black (African-American) women and younger (premenopausal) women, so that those groups would be represented at roughly equal levels to White and older women.</div>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
                      <li>Enrolled thousands of participants collecting tumor tissue, biospecimens, and detailed demographic, clinical, and exposure data — enabling robust subgroup analyses</li>
                      <li><b>Result</b>: Identified differences in tumor subtypes and outcomes (for example, higher prevalence of basal-like/triple-negative tumors among Black women)</li>
                      <li><b>Impact</b>: A great model for studying disparities in breast cancer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real World Example: Limited (duplicated formatting with red X) */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
                    <X className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold m-0">Early Cardiovascular Disease Trials (1960s–1980s) </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Many early heart disease studies recruited mostly middle-aged white men. Women and racial/ethnic minorities were largely excluded</div>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
                      <li><b>Result</b>: For years, heart attack symptoms in women were underrecognized because early data reflected only male presentations (e.g., chest pain vs. atypical symptoms like nausea or fatigue).</li>
                      <li><b>Impact</b>: Diagnostic guidelines were biased, leading to missed or delayed treatment for women.</li>

                    </ul>

                </div>
              </div>
            </div>
          </div>

         {/* How we score study size */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <DialogTitle className="text-2xl m-0">How do we score Population Representation?</DialogTitle>
            </div>
            <div className="text-md text-muted-foreground">
              The Health Integrity Project allows experts to <b>categorize</b> evidence on diversity traits such as <b>ethnicity</b> and <b>age</b>, Age is labeled by selecting from existing age brackets and ethnicity can be explictly defined or selected from a drop-down list.
              <br></br>
              <br></br>
              <b>What about balancing representation across sexes?</b> If there are no women included in the study population, the final label is "Not Tested in Women".
            </div>
          </div>
          

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopulationDiversityCard;
