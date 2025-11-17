import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass, BookOpen, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudyDesignCard = () => {
  const [studyDesignOpen, setStudyDesignOpen] = React.useState(false);

  return (
    <Dialog open={studyDesignOpen} onOpenChange={setStudyDesignOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Study Design</CardTitle>
            <CardDescription className="text-base font-medium">
              Careful planning leads to credible results
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-2xl">
             <Compass className="w-6 h-6 text-primary" />
             Important aspects of Study Design
           </DialogTitle>
           <DialogDescription className="text-base">
             Understanding how thoughtful design increases the reliability of research findings.
           </DialogDescription>
           <br />
          <img
          src="/images/study_design.png"
          alt="Study design icons representing different aspects of research planning"
          className="w-full max-w-sm sm:max-w-md mx-auto mt-4 rounded-lg shadow-sm object-cover"
            />
         </DialogHeader>
         <div className="space-y-6 mt-6">
           {/* Introduction */}
           <div>

             <p className="text-muted-foreground">
               Thoughtful consideration when conducting a scientific experiment increases the chances of a reliable result. Balanced cohorts, proper controls, and rigorous quality checks ensure good data. Appropriate statistical models suitable for the design strengthens confidence in the results.
             </p>
           </div>
        <div>
            <h3 className="text-lg font-semibold mb-3">Important considerations </h3>
            <p className="text-muted-foreground">
              Design is the foundation of trustworthy science. It ensures that <b>research questions are tested in a fair, unbiased, and reproducible way</b>. Below we highlight elements that The Health Integrity Project focuses on to assess the reliability of a study.
            </p>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Robust Study
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Appropriate study design aligned with research goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Proper control groups and comparison conditions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Randomization and blinding (when applicable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Suitable statistical methods with assumptions checked</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  {/* <AlertTriangle className="w-5 h-5" /> */}
                  Inadequate Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Mismatched design (e.g., observational design for causal claims)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Missing, inappropriate, or poorly matched controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Missing, inappropriate, or poorly matched controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Misapplied or incorrect statistical analyses</span>
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


         </div>
       </DialogContent>
     </Dialog>
  );
};

export default StudyDesignCard;
