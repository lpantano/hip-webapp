import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Vote, 
  Calendar, 
  Award, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  CheckCircle,
  Star,
  Target,
  Shield,
  Clock
} from 'lucide-react';

interface ExpertOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

const ExpertOnboardingDialog = ({ open, onOpenChange, onApply }: ExpertOnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Our Expert Community",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">You're Part of the Company</h3>
            <p className="text-muted-foreground text-lg">
              As an expert, you become an integral part of our organization with real ownership and decision-making power.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Vote className="h-5 w-5 text-primary" />
                  Voting Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Vote on new features, research topics, and platform direction
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-accent" />
                  Strategy Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Two annual meetings to shape business strategy and direction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Contribution & Credit System",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-4">Earn Credits for Your Work</h3>
            <p className="text-muted-foreground text-lg">
              Every contribution you make earns credits that can be redeemed for profit sharing.
            </p>
          </div>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Star className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">First Contributions Count Double</h4>
                    <p className="text-sm text-muted-foreground">
                      Your first review of each claim and publication earns 2x credits, rewarding early engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-accent bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Profit Sharing</h4>
                    <p className="text-sm text-muted-foreground">
                      When the company is profitable, credits can be redeemed for money proportional to total profits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-muted-foreground bg-muted/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-muted-foreground mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Contract Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Full terms and conditions available in the contract at the end of the application process
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Review Criteria & Scoring",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">4 Key Review Criteria</h3>
            <p className="text-muted-foreground text-lg">
              Score each publication or claim across these standardized criteria.
            </p>
          </div>
          
          <div className="grid gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Study Size
                  </CardTitle>
                  <Badge variant="outline">Score: 1-10</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evaluate the sample size and whether it's adequate for drawing meaningful conclusions
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-accent" />
                    Population Representation
                  </CardTitle>
                  <Badge variant="outline">Score: 1-10</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    How well does the study population represent the target demographic for the claim?
                  </p>
                  <div className="bg-accent/10 p-3 rounded-lg border-l-2 border-accent">
                    <p className="text-xs text-muted-foreground">
                      <strong>Why this matters:</strong> Population bias can completely invalidate study results. 
                      For example, a study on heart disease conducted only on men may not apply to women due to 
                      biological differences. Similarly, studies on predominantly white populations may not 
                      generalize to other ethnic groups due to genetic, cultural, or socioeconomic factors.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Consider:</strong> Age, gender, ethnicity, socioeconomic status, geographic location, 
                    health status, and other relevant demographics
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-muted-foreground/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Vote className="h-5 w-5 text-muted-foreground" />
                    Research Consensus
                  </CardTitle>
                  <Badge variant="outline">Score: 1-10</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Level of agreement among multiple studies and researchers on this topic
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Valid Conclusion
                  </CardTitle>
                  <Badge variant="outline">Score: 1-10</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Whether the study's conclusions are logically supported by the data and methodology
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Scoring Guide:</strong> 1-3 (Poor), 4-6 (Fair), 7-8 (Good), 9-10 (Excellent). 
              Provide detailed notes explaining your scores to help the community understand your assessment.
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApply = () => {
    onOpenChange(false);
    onApply();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {steps[currentStep].title}
          </DialogTitle>
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 
                  index < currentStep ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="py-6">
          {steps[currentStep].content}
        </div>

        <Separator />

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertOnboardingDialog;