import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Building2, Map } from 'lucide-react';

const NavigationSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Learn More About TekaHealth</h2>
            <p className="text-muted-foreground">
              Discover our team, vision, approach, and roadmap for the future
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Button asChild variant="outline">
                  <Link to="/about#vision">Read Our Vision</Link>
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
                <Button asChild variant="outline">
                  <Link to="/about#business-model">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-primary/20">
              <CardHeader className="text-center">
                <Map className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Roadmap & Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Explore our future plans and ways to support our mission
                </p>
                <Button asChild variant="outline">
                  <Link to="/roadmap">View Roadmap</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationSection;