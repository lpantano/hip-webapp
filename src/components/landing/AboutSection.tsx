import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Our Mission
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Bringing Scientific Rigor to 
            <span className="text-primary"> Women's Health</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Too many women's health products lack proper scientific backing. Our platform connects 
            qualified experts with consumers to evaluate research quality and product claims.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary text-xl">For Everyone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access expert reviews of health products and services. Make informed decisions 
                based on scientific evidence.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Read expert evaluations</li>
                <li>• Rate review helpfulness</li>
                <li>• Access educational materials</li>
                <li>• Stay updated on new reviews</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-accent text-xl">For Experts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share your expertise by reviewing research quality across four key criteria. 
                Help improve women's health literacy.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Evaluate research studies</li>
                <li>• Provide expert insights</li>
                <li>• Educate the community</li>
                <li>• Build your profile</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card-gradient border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary text-xl">The Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Creating transparency in women's health by focusing on underdiagnosed 
                conditions and commonly marketed products.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Evidence-based decisions</li>
                <li>• Increased health literacy</li>
                <li>• Better product standards</li>
                <li>• Community empowerment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;