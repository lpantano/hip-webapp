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
      title: "Welcome to the Expert Community",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">Shape the Future of Evidence-Based Health</h3>
            <p className="text-muted-foreground text-lg">
              As an expert, you’ll help ensure the quality and trustworthiness of health claims. Your reviews directly impact which claims are highlighted and how users understand the evidence.
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
                  Participate in platform decisions, including feature prioritization and research focus.
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
                  Join annual meetings to help guide our mission and standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Earn Recognition for Your Expertise",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-4">Transparent Credit & Rewards</h3>
            <p className="text-muted-foreground text-lg">
              Every review you submit earns you credits, which can be redeemed for profit sharing and public recognition.
            </p>
          </div>
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Star className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">First Reviews Count Double</h4>
                    <p className="text-sm text-muted-foreground">
                      Your first review for each claim or publication earns double credits, rewarding early contributions.
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
                      When the platform is profitable, credits can be exchanged for a share of profits.
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
                    <h4 className="font-semibold mb-2">Clear Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      All details are available in the expert agreement at the end of this process.
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
      title: "How to Review a Publication",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">Standardized Criteria for Every Review</h3>
            <p className="text-muted-foreground text-lg">
              For each publication, you’ll be asked to assess the following:
            </p>
          </div>
          <div className="grid gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Publication Validity
                  </CardTitle>
                  {/* Score badge removed */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Is the publication from a reputable, peer-reviewed journal? Is it original research (not a review or meta-analysis)?
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-accent" />
                    Quality Assessment
                  </CardTitle>
                  {/* Score badge removed */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Does the study have a sound design, appropriate population, control group, and statistical methods?
                  </p>
                  <div className="bg-accent/10 p-3 rounded-lg border-l-2 border-accent">
                    <p className="text-xs text-muted-foreground">
                      Study Design, Population Representation, Control Group, Biases Addressed, and Statistical Methods.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Consider:</strong> Age, gender, ethnicity, socioeconomic status, geographic location, health status, and other relevant demographics.
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted-foreground/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Vote className="h-5 w-5 text-muted-foreground" />
                    System Used
                  </CardTitle>
                  {/* Score badge removed */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  What type of system was studied? (e.g., cell, animal, or human)
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Study Size
                  </CardTitle>
                  {/* Score badge removed */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  How large was the study? (Small: &lt;100, Medium: 100–100,000, Large: &gt;100,000)
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Also consider:</strong> Demographic representation and any limitations or biases.
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