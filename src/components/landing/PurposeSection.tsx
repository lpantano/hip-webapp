import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Users } from "lucide-react";

const PurposeSection = () => {
  const purposes = [
    {
      icon: AlertTriangle,
      title: "The Problem",
      description: "Health misinformation is everywhere. From social media influencers to wellness brands, women face conflicting claims about what's healthy, effective, or safe. Critical health decisions deserve better than guesswork.",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: Shield,
      title: "Our Solution",
      description: "We connect you with expert-reviewed health claims backed by peer-reviewed research. We translate complex studies into clear insights, showing you what works, what doesn't, and what the science actually says.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <section className="py-12 sm:py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Purpose</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {purposes.map((purpose, index) => {
            const Icon = purpose.icon;
            return (
              <Card
                key={index}
                className="border-border/50 "
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${purpose.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${purpose.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {purpose.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {purpose.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PurposeSection;
