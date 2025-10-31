import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';

interface Founder {
  name: string;
  role: string;
  bio: string;
  avatar_url: string;
}

const Team = () => {
  const founders: Founder[] = [
    {
      name: "Lorena Pantano",
      role: "CEO / Chief Product Officer",
      bio: "Leading product strategy and company vision with 10+ years in health tech innovation.",
      avatar_url: "/team/lorena-pantano.jpg"
    },
    {
      name: "Meeta Mistry",
      role: "Chief Scientific Officer",
      bio: "PhD in Data Science, specializing in health data analysis and women's health research.",
      avatar_url: "/team/meeta-mistry.jpg"
    },
    {
      name: "Judit Flo Gaya",
      role: "Chief Security Officer",
      bio: "Cybersecurity expert ensuring the highest standards of data protection and privacy.",
      avatar_url: "/team/judit-flo.png"
    },
    {
      name: "Lina Faller",
      role: "Chief Technology Officer",
      bio: "Full-stack engineer with expertise in scalable health platforms and AI integration.",
      avatar_url: "/team/lina-faller.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 pb-2 leading-[1.15] overflow-visible bg-hero-gradient bg-clip-text text-transparent">
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
                    <Avatar className="w-24 h-24 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                      <AvatarImage src={founder.avatar_url} alt={founder.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-bold text-primary">
                        {founder.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
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
        </div>
      </main>
    </div>
  );
};

export default Team;
