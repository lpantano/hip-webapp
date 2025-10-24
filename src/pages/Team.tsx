import { Users, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

const Team = () => {
  const founders = [
    {
      name: "Lorena Pantano",
      role: "CEO / Chief Product Officer",
      bio: "Leading product strategy and company vision with 10+ years in health tech innovation.",
    },
    {
      name: "Meeta Mistry", 
      role: "Chief Scientific Officer",
      bio: "PhD in Data Science, specializing in health data analysis and women's health research.",
    },
    {
      name: "Judit Flo Gaya",
      role: "Chief Security Officer", 
      bio: "Cybersecurity expert ensuring the highest standards of data protection and privacy.",
    },
    {
      name: "Lina Faller",
      role: "Chief Technology Officer",
      bio: "Full-stack engineer with expertise in scalable health platforms and AI integration.",
    }
  ];

  const openPositions = [
    {
      title: "Chief Financial Officer (CFO)",
      department: "Finance",
      description: "Handle financial operations, tax compliance, and ensure proper money management for our cooperative structure.",
      timeCommitment: "3 hours/week",
      requirements: [
        "Experience with tax filing and financial compliance",
        "Understanding of cooperative business structures",
        "Strong attention to detail and organizational skills"
      ]
    },
    {
      title: "Chief Business Officer (CBO)", 
      department: "Business Development",
      description: "Lead fundraising efforts, secure donations, and establish relationships with angel investors to support our mission.",
      timeCommitment: "3 hours/week",
      requirements: [
        "Experience in fundraising or business development",
        "Network of potential investors or donors",
        "Strong communication and presentation skills"
      ]
    },
    {
      title: "Head of Marketing",
      department: "Marketing & Engagement", 
      description: "Manage social media accounts, create engaging content, and build our community presence across platforms.",
      timeCommitment: "3 hours/week",
      requirements: [
        "Experience managing social media accounts",
        "Creative content creation skills",
        "Understanding of user engagement strategies"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6  bg-hero-gradient bg-clip-text text-transparent">
              Meet Our Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Passionate experts dedicated to revolutionizing women's health through data-driven insights and evidence-based research.
            </p>
          </div>

          {/* Founders Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Our Founders
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {founders.map((founder, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <CardHeader className="text-center pb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <CardTitle className="text-xl">{founder.name}</CardTitle>
                    <Badge variant="secondary" className="mx-auto">{founder.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-sm leading-relaxed">
                      {founder.bio}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Open Positions Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <MapPin className="h-8 w-8 text-accent" />
              Open Positions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {openPositions.map((position, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/30">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{position.department}</Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-accent transition-colors">
                      {position.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {position.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Time Commitment:</span>
                        <Badge variant="secondary">{position.timeCommitment}</Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {position.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-start gap-2">
                              <span className="text-accent mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Interested in joining our mission? We're always looking for passionate individuals.
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90">
                <Mail className="h-5 w-5 mr-2" />
                Get In Touch
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Team;