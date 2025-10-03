import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CommunityApplicationForm from "@/components/forms/CommunityApplicationForm";
import ExpertOnboardingDialog from "@/components/forms/ExpertOnboardingDialog";

const JoinSection = () => {
  const [email, setEmail] = useState("");
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  const handleMailingList = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement mailing list signup
    console.log("Mailing list signup:", email);
    setEmail("");
  };

  return (
    <section className="pb-20 pt-8 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-accent border-accent">
            Join the Movement
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Make a 
            <span className="text-accent"> Difference?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="bg-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Join as a User</CardTitle>
              <p className="text-muted-foreground">
                Access expert reviews and make informed health decisions
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Create account with Gmail, email, or LinkedIn</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Browse expert reviews and ratings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Rate review helpfulness</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Access educational materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Voting rights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Learn how we review science</span>
                </div>
              </div>
              <Button asChild className="w-full mt-6 bg-primary hover:bg-primary/90">
                <Link to="/auth">
                  {user ? 'Welcome Back!' : 'Sign Up Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">Apply as expert or researcher</CardTitle>
              <p className="text-muted-foreground">
                Scientists and healthcare professionals - by invitation only
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Invitation-based exclusive access</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Review research across 4 key criteria</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Free membership</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Data insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Promote services</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Voting rights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Distribution profit</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted"
                  onClick={() => setShowOnboarding(true)}
                >
                  Learn How It Works
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setShowExpertForm(true)}
                >
                  Request Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ExpertOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onApply={() => setShowExpertForm(true)}
      />
      
      <CommunityApplicationForm 
        open={showExpertForm}
        onOpenChange={setShowExpertForm}
        memberType="expert"
      />
    </section>
  );
};

export default JoinSection;