import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { DollarSign, Users, TrendingUp, Heart, Vote, Coins } from 'lucide-react';

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Development Roadmap
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join our journey towards sustainable, community-driven research platform
            </p>
          </div>
        </div>
      </section>

      {/* Current Phase - Early Access */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Phase 1: Early Access</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground">
                Currently accepting donations and early supporters
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <Coins className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-primary">Forever Membership</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">$50</div>
                  <p className="text-muted-foreground mb-4">
                    Get lifetime access to all premium features with a one-time payment. 
                    This includes voting rights in our cooperative structure.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Lifetime premium access</li>
                    <li>• Voting rights on new features</li>
                    <li>• Priority support</li>
                    <li>• Access to exclusive research</li>
                  </ul>
                  <Button className="w-full mt-6">
                    Become a Founding Member
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <Heart className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-primary">Support Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Help us build a platform that empowers women with evidence-based insights. 
                    Every donation supports our development and research efforts.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">Donate $10</Button>
                    <Button variant="outline" className="w-full">Donate $25</Button>
                    <Button variant="outline" className="w-full">Custom Amount</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Future Phase - Membership Model */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Phase 2: Membership Model</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground">
                Starting next year: sustainable membership-based access
              </p>
            </div>

            <Card className="border-primary/20 max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Annual Membership</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-primary mb-4">$20/year</div>
                <p className="text-muted-foreground mb-6">
                  Access all premium features with our affordable annual membership. 
                  Early supporters with forever membership continue to access everything for free.
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Founding members who purchased the $50 forever membership 
                    will never be charged and maintain all premium benefits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Profit Distribution */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Profit Distribution Model</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground">
                How we allocate resources to ensure sustainability and growth
              </p>
            </div>

            <div className="space-y-6">
              {/* Priority 1: Infrastructure */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                    <CardTitle>Infrastructure & Operations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cloud expenses, administrative fees, and essential operational costs to keep the platform running.
                  </p>
                </CardContent>
              </Card>

              {/* Priority 2: Contributors */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    <CardTitle>Contributors & Experts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compensation for contributors and experts based on their research contributions and peer reviews.
                  </p>
                </CardContent>
              </Card>

              {/* Priority 3: Advisors */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                    <CardTitle>Advisors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Payment for advisory services and strategic guidance from industry experts and researchers.
                  </p>
                </CardContent>
              </Card>

              {/* Priority 4: Core Team */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                    <CardTitle>Executive Team & Ambassadors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compensation for founders, executives, and ambassadors who lead the organization and community outreach.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Surplus Investment */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Surplus Investment Strategy</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground">
                When we exceed operational costs, here's how we invest in the future
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-primary/20 text-center">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Team Expansion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hire more developers, researchers, and support staff to build new features. 
                    Members vote on priorities and new hires.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 text-center">
                <CardHeader>
                  <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Emergency Fund</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build reserves to weather potential losses and ensure we can maintain 
                    employee compensation during challenging periods.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 text-center">
                <CardHeader>
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Charitable Giving</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Donate excess profits to organizations that align with our mission 
                    of empowering women and advancing research accessibility.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 bg-primary/5 rounded-lg p-8 text-center">
              <Vote className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Democratic Decision Making</h3>
              <p className="text-muted-foreground text-lg">
                All major decisions about feature development, hiring, and surplus allocation 
                are voted on by our cooperative members, ensuring the platform serves its community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Roadmap;