import { useState } from 'react';
import { MapPin, Calendar, Users, ExternalLink, MessageSquare, ThumbsUp, FileText, Linkedin, Instagram, Globe, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';

interface Expert {
  id: string;
  name: string;
  title: string;
  location: string;
  yearsExperience: number;
  yearsOnPlatform: number;
  avatar?: string;
  motivation: string;
  business: string;
  education: string;
  expertise: string[];
  stats: {
    postsReviewed: number;
    comments: number;
    votes: number;
  };
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    newsletter?: string;
    webpage?: string;
  };
  isActive: boolean;
}

const Experts = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const experts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Sarah Williams',
      title: 'Women\'s Health Specialist',
      location: 'San Francisco, CA',
      yearsExperience: 15,
      yearsOnPlatform: 3,
      motivation: 'I joined this platform to bridge the gap between clinical expertise and accessible health information for women worldwide.',
      business: 'Founder of Women\'s Health Innovations, a clinic specializing in reproductive health and hormonal wellness.',
      education: 'MD from Stanford University, Residency in Obstetrics & Gynecology at UCSF',
      expertise: ['Reproductive Health', 'Hormonal Wellness', 'PCOS', 'Fertility'],
      stats: { postsReviewed: 245, comments: 89, votes: 312 },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahwilliamsmd',
        instagram: 'https://instagram.com/drSarahwellness',
        newsletter: 'https://newsletter.sarahwilliams.com',
        webpage: 'https://sarahwilliamsmd.com'
      },
      isActive: true
    },
    {
      id: '2',
      name: 'Jessica Chen',
      title: 'Wellness Technology Expert',
      location: 'Austin, TX',
      yearsExperience: 8,
      yearsOnPlatform: 2,
      motivation: 'Technology has the power to democratize health information, and I\'m passionate about making wellness accessible to all women.',
      business: 'CTO at FemTech Solutions, developing AI-powered health tracking applications.',
      education: 'MS Computer Science from MIT, BS Biomedical Engineering from Rice University',
      expertise: ['Health Technology', 'Wearable Devices', 'Data Privacy', 'AI in Healthcare'],
      stats: { postsReviewed: 156, comments: 67, votes: 203 },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/jessicachen-tech',
        webpage: 'https://jessicachen.dev'
      },
      isActive: true
    },
    {
      id: '3',
      name: 'Dr. Maria Rodriguez',
      title: 'Mental Health & Wellness Coach',
      location: 'Miami, FL',
      yearsExperience: 12,
      yearsOnPlatform: 4,
      motivation: 'Mental health is just as important as physical health, especially for women facing unique life challenges.',
      business: 'Licensed therapist and founder of Mindful Women Therapy, specializing in women\'s mental health.',
      education: 'PhD in Clinical Psychology from University of Miami, Specialized training in women\'s mental health',
      expertise: ['Mental Health', 'Stress Management', 'Postpartum Depression', 'Anxiety'],
      stats: { postsReviewed: 298, comments: 124, votes: 456 },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/drmariarodriguez',
        instagram: 'https://instagram.com/mindfulwomentherapy',
        newsletter: 'https://mindfulwomen.substack.com'
      },
      isActive: true
    },
    {
      id: '4',
      name: 'Dr. Amanda Foster',
      title: 'Nutritional Science Expert',
      location: 'Seattle, WA',
      yearsExperience: 18,
      yearsOnPlatform: 1,
      motivation: 'After years of clinical practice, I realized the need for evidence-based nutrition information tailored specifically for women.',
      business: 'Former Chief Nutritionist at Seattle Medical Center, now consulting for health tech companies.',
      education: 'PhD in Nutritional Science from University of Washington, RD certification',
      expertise: ['Women\'s Nutrition', 'Metabolic Health', 'Eating Disorders', 'Sports Nutrition'],
      stats: { postsReviewed: 87, comments: 34, votes: 145 },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/amandafoster-nutrition',
        webpage: 'https://amandafosternutrition.com'
      },
      isActive: false
    }
  ];

  const activeExperts = experts.filter(expert => expert.isActive);
  const pastExperts = experts.filter(expert => !expert.isActive);

  const openProfile = (expert: Expert) => {
    setSelectedExpert(expert);
  };

  const ExpertCard = ({ expert }: { expert: Expert }) => (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer relative"
      onClick={() => openProfile(expert)}
    >
      {/* Experience Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        <Badge variant="secondary" className="text-xs font-bold bg-primary/90 text-primary-foreground hover:bg-primary">
          {expert.yearsExperience}y exp
        </Badge>
        <Badge variant="outline" className="text-xs font-bold bg-background/90 border-accent text-accent">
          {expert.yearsOnPlatform}y here
        </Badge>
      </div>
      
      <CardHeader className="text-center pb-4">
        <Avatar className="w-20 h-20 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
          <AvatarImage src={expert.avatar} alt={expert.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
            {expert.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{expert.name}</CardTitle>
        <CardDescription className="text-sm font-medium text-primary">{expert.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {expert.location}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {expert.expertise.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {expert.expertise.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{expert.expertise.length - 3} more
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          {expert.socialLinks.linkedin && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <Linkedin className="h-4 w-4" />
            </Button>
          )}
          {expert.socialLinks.instagram && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <Instagram className="h-4 w-4" />
            </Button>
          )}
          {expert.socialLinks.webpage && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <Globe className="h-4 w-4" />
            </Button>
          )}
          {expert.socialLinks.newsletter && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Experts
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the dedicated professionals who review, contribute, and guide our community with their expertise in women's health, wellness, and technology.
            </p>
          </div>

          {/* Current Experts Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Current Experts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </section>

          {/* Past Experts Section */}
          {pastExperts.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                Past Contributors
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pastExperts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Expert Profile Dialog */}
      <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExpert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedExpert.avatar} alt={selectedExpert.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
                      {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedExpert.name}</DialogTitle>
                    <DialogDescription className="text-lg text-primary font-medium">
                      {selectedExpert.title}
                    </DialogDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedExpert.location}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-primary">{selectedExpert.stats.postsReviewed}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Posts Reviewed</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageSquare className="h-4 w-4 text-accent" />
                      <span className="text-2xl font-bold text-accent">{selectedExpert.stats.comments}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{selectedExpert.stats.votes}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Votes</p>
                  </div>
                </div>

                <Separator />

                {/* Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years of Experience</h4>
                    <p className="text-lg font-bold">{selectedExpert.yearsExperience} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years on Platform</h4>
                    <p className="text-lg font-bold">{selectedExpert.yearsOnPlatform} years</p>
                  </div>
                </div>

                <Separator />

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold mb-3">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Motivation */}
                <div>
                  <h4 className="font-semibold mb-3">Motivation</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedExpert.motivation}</p>
                </div>

                {/* Business */}
                <div>
                  <h4 className="font-semibold mb-3">Professional Background</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedExpert.business}</p>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3">Education</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedExpert.education}</p>
                </div>

                <Separator />

                {/* Social Links */}
                <div>
                  <h4 className="font-semibold mb-3">Connect</h4>
                  <div className="flex gap-2">
                    {selectedExpert.socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedExpert.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {selectedExpert.socialLinks.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedExpert.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {selectedExpert.socialLinks.webpage && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedExpert.socialLinks.webpage} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {selectedExpert.socialLinks.newsletter && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedExpert.socialLinks.newsletter} target="_blank" rel="noopener noreferrer">
                          <Mail className="h-4 w-4 mr-2" />
                          Newsletter
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Experts;