import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { Users, Eye, Building2 } from 'lucide-react';

const About = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About What Data Says
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Empowering women with evidence-based insights through collaborative research and transparent data analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Links */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/20">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Our Team</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Meet the passionate individuals behind our mission
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/team">Meet the Team</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/20">
                <CardHeader className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Discover what drives us and our future goals
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => scrollToSection('vision')}
                  >
                    Read Our Vision
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/20">
                <CardHeader className="text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Business Model</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Learn about our cooperative structure and values
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => scrollToSection('business-model')}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-primary">Transforming Research Access</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We envision a world where every woman has access to reliable, evidence-based information 
                  about health, career, and life decisions. Our mission is to bridge the gap between 
                  complex research and practical insights.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  By making research transparent, accessible, and actionable, we empower women to make 
                  informed decisions backed by solid evidence rather than myths or assumptions.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3 text-primary">Evidence-Based Decisions</h4>
                    <p className="text-muted-foreground">
                      Every claim backed by transparent, peer-reviewed research with clear methodology.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3 text-primary">Community-Driven</h4>
                    <p className="text-muted-foreground">
                      Built by and for women, ensuring relevant and meaningful insights for our community.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3 text-primary">Transparent Process</h4>
                    <p className="text-muted-foreground">
                      Open about our sources, methodology, and potential limitations in every analysis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section id="business-model" className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Our Business Model</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              <p className="text-xl text-muted-foreground">
                A cooperative structure that puts community and contributors first
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Cooperative Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    What Data Says operates as a cooperative where every member has a weighted vote 
                    in the company's direction. This ensures that decisions reflect the community's 
                    needs and values.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Democratic decision-making process</li>
                    <li>• Weighted voting based on contribution level</li>
                    <li>• Transparent governance structure</li>
                    <li>• Community-driven priorities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Profit Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our profits are reinvested back into the community and product development, 
                    ensuring sustainable growth that benefits everyone involved.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Returns to contributors and full-time employees</li>
                    <li>• Investment in new product development</li>
                    <li>• Research funding and data acquisition</li>
                    <li>• Platform improvements and accessibility</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Investment & Support</h3>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-4 text-primary">Angel Investors</h4>
                  <p className="text-muted-foreground mb-4">
                    We welcome angel investors who align with our mission of empowering women 
                    through evidence-based insights.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Investors participate in our cooperative structure while maintaining 
                    our community-first approach.
                  </p>
                </div>
                
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-4 text-primary">Donations</h4>
                  <p className="text-muted-foreground mb-4">
                    Donations help us maintain free access to essential research insights 
                    and support underrepresented communities.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Every donation directly impacts our ability to provide transparent, 
                    accessible research analysis.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/roadmap">View Our Roadmap & Support Options</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;