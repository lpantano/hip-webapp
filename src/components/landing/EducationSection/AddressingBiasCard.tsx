import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Filter, BookOpen, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AddressingBiasCard = () => {
  const [biasOpen, setBiasOpen] = React.useState(false);

  return (
    <Dialog open={biasOpen} onOpenChange={setBiasOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Addressing Bias</CardTitle>
            <CardDescription className="text-base font-medium">
              Clear the noise to see the signal
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Filter className="w-6 h-6 text-primary" />
            Addressing Bias
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how researchers identify and control for confounding variables to reduce bias
          </DialogDescription>
           <br />
          <img
          src="/images/addressing_bias2.png"
          alt="Study design icons representing different aspects of research planning"
          className="w-full max-w-lg sm:max-w-2xl mx-auto mt-4 rounded-lg shadow-sm object-cover"
            />
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              Human studies are complex. Differences in age, background, and other factors can influence results, so <b>careful design and proper analysis</b> are key. By identifying and controlling for bias, researchers can strengthen the integrity and impact of their studies.
            </p>
          </div>

        <div>
            <h2 className="text-xl font-semibold mb-3">Spotting Bias and Taking Action </h2>
            <p className="text-muted-foreground">
            When working with human populations, a wide range of demographic and external factors must be taken into account. Although researchers strive to create balanced study groups, <b>perfect balance is rarely achievable</b>. Below, we summarize potential sources of biases in studies and approaches to help mitigate or control its effects.
            </p>
          </div>


          {/* Key Strategies */}
          <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  {/* <AlertTriangle className="w-5 h-5" /> */}
                  Sources of Bias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Unbalanced or non-representative study populations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Recruitment from a narrow demographic or excluding certain groups without justification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Outcome assessment influenced by knowledge of group assignment </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Misapplied or inappropriate statistical methods</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Presence of confounding variables</span>
                </div>
              </CardContent>
            </Card>


            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Approaches for Mitigating Bias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Recruit a diverse sample and apply inclusion/exclusion criteria consistently</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Stratified sampling if needed or randomization to distribute confounding variables</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Ensure proper blinding of participants, investigators, and outcome assessors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Apply appropriate statistical tests and verify assumptions</span>
                </div>
              </CardContent>
            </Card>
            </div>

           <div>
            <p className="text-muted-foreground">
            If you have identified potential sources of bias in a study, <b>statistical techniques can help</b> adjust for these confounding factors( i.e. multivariate regression).
            <br></br>
            <br></br>
            However, it's important to note that while these methods can aid in correction, they may not completely eliminate bias. Therefore, <b>transparent reporting and critical appraisal of study design and analysis</b>  are essential for interpreting results accurately.
            </p>
          </div>       


        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AddressingBiasCard;
