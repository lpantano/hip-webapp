import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BookOpen, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResearchConsensusCard = () => {
  const [consensusOpen, setConsensusOpen] = React.useState(false);

  return (
    <Dialog open={consensusOpen} onOpenChange={setConsensusOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Consensus</CardTitle>
            <CardDescription className="text-base font-medium">
              Repeated results build confidence
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-primary" />
            Consensus
          </DialogTitle>
          <DialogDescription className="text-base">
            Why multiple independent studies reaching the same conclusion provides stronger evidence
          </DialogDescription>
            <br />
          <img
          src="/images/consensus2.png"
          alt="Study design icons representing different aspects of research planning"
          className="w-full max-w-lg sm:max-w-2xl mx-auto mt-4 rounded-lg shadow-sm object-cover"
            />         
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              When findings are confirmed through independent experiments, it demonstrates that the results are consistent, and <b>not due to chance or specific conditions</b>. Reproducible outcomes across different studies and research groups provide stronger evidence and validation for the results.
            </p>
          </div>

          {/* Key Factors Card */}
           <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  {/* <CheckCircle className="w-5 h-5" /> */}
                  Why Consensus Across Studies Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-base">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><b>Minimizes Bias:</b> Different research groups, methods, and populations reduce the likelihood that one research group’s biases shape conclusions.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><b>Improves Generalizability:</b> Findings that hold across diverse samples are more likely to apply in real-world settings.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><b>Clarifies True Effects:</b> Consensus helps separate real biological or clinical signals from false positives.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><b>Identifies Patterns Across Methods:</b> Agreement across studies reveals robust scientific principles.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span><b>Supports Best Practices:</b> Repeated results help standardize methods and improve research quality.</span>
                </div>
              </CardContent>
            </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchConsensusCard;
