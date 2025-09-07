import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, ExternalLink, MessageSquare, ThumbsUp, FileText, Linkedin, Instagram, Globe, Mail, Twitter, Youtube, Facebook, Hash, Podcast, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';

interface Expert {
  id: string;
  user_id: string;
  expertise_area: string;
  education: string;
  motivation: string;
  website?: string;
  years_of_experience?: number;
  location?: string;
  avatar_url?: string;
  created_at?: string;
  display_name?: string;
  profile_avatar_url?: string;
  bio?: string;
  social_media_links: any;
}

const Experts = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      // Fetch from experts_full view
      const { data: expertsData, error: expertsError } = await supabase
        .from('experts_full')
        .select('*')
      // console.log(expertsData);
    if (expertsError) throw expertsError;
        setExperts(expertsData || []);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatExpertiseArea = (area: string) => {
    return area
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getYearsOnPlatform = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const years = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (365 * 24 * 60 * 60 * 1000)));
    return years;
  };

  const getSocialLink = (links: { platform: string; url: string }[], platform: string) => {
    return links.find(link => 
      link.platform.toLowerCase().includes(platform.toLowerCase())
    )?.url;
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      case 'youtube': return Youtube;
      case 'facebook': return Facebook;
      case 'tiktok': return Hash; // TikTok uses # symbol
      case 'reddit': return MessageSquare; // Reddit discussion icon
      case 'podcast': return Podcast;
      default: return Link; // Generic link icon for 'other'
    }
  };

  const openProfile = (expert: Expert) => {
    setSelectedExpert(expert);
  };

  const ExpertCard = ({ expert }: { expert: Expert }) => {
    const displayName = expert.display_name || `${formatExpertiseArea(expert.expertise_area)} Expert`;
    const avatarUrl = expert.profile_avatar_url || expert.avatar_url;
    const expertiseTitle = formatExpertiseArea(expert.expertise_area) + ' Specialist';
    const yearsOnPlatform = getYearsOnPlatform(expert.created_at);
    
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer relative"
        onClick={() => openProfile(expert)}
      >
        {/* Experience Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <Badge variant="secondary" className="text-xs font-bold bg-primary/90 text-primary-foreground hover:bg-primary">
            {expert.years_of_experience}y exp
          </Badge>
          <Badge variant="outline" className="text-xs font-bold bg-background/90 border-accent text-accent">
            {yearsOnPlatform}y here
          </Badge>
        </div>
        
        <CardHeader className="text-center pb-4">
          <Avatar className="w-20 h-20 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
              {displayName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg">{displayName}</CardTitle>
          <CardDescription className="text-sm font-medium text-primary">{expertiseTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {expert.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {expert.location}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-3">
            <Badge variant="secondary" className="text-xs">
              {formatExpertiseArea(expert.expertise_area)}
            </Badge>
          </div>
          <div className="flex gap-2 mt-3">
            {expert.social_media_links.map((link: { platform: string; url: string }) => {
              if (!link.platform || !link.url) return null;
              const Icon = getSocialIcon(link.platform);
              return (
                <Button 
                  key={link.platform}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => e.stopPropagation()}
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              );
            })}
            {expert.website && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} asChild>
                <a href={expert.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading experts...</p>
              </div>
            ) : experts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No experts have been approved yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            )}
          </section>
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
                    <AvatarImage src={selectedExpert.profile_avatar_url || selectedExpert.avatar_url} alt={selectedExpert.display_name || `${formatExpertiseArea(selectedExpert.expertise_area)} Expert`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
                      {selectedExpert.display_name ? selectedExpert.display_name.split(' ').map(n => n[0]).join('') : formatExpertiseArea(selectedExpert.expertise_area).split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedExpert.display_name || `${formatExpertiseArea(selectedExpert.expertise_area)} Expert`}</DialogTitle>
                    <DialogDescription className="text-lg text-primary font-medium">
                      {formatExpertiseArea(selectedExpert.expertise_area)} Specialist
                    </DialogDescription>
                    {selectedExpert.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        {selectedExpert.location}
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years of Experience</h4>
                    <p className="text-lg font-bold">{selectedExpert.years_of_experience} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years on Platform</h4>
                    <p className="text-lg font-bold">{getYearsOnPlatform(selectedExpert.created_at)} years</p>
                  </div>
                </div>

                <Separator />

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold mb-3">Area of Expertise</h4>
                  <Badge variant="secondary">
                    {formatExpertiseArea(selectedExpert.expertise_area)}
                  </Badge>
                </div>

                <Separator />

                {/* Motivation */}
                <div>
                  <h4 className="font-semibold mb-3">Motivation</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedExpert.motivation}</p>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3">Education & Background</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedExpert.education}</p>
                </div>

                <Separator />

                {/* Social Links */}
                {(selectedExpert.social_media_links.length > 0 || selectedExpert.website) && (
                  <div>
                    <h4 className="font-semibold mb-3">Connect</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.social_media_links.map((link: { platform: string; url: string }) => {
                        if (!link.platform || !link.url) return null;
                        const Icon = getSocialIcon(link.platform);
                        const platformName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                        return (
                          <Button key={link.platform} variant="outline" size="sm" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <Icon className="h-4 w-4 mr-2" />
                              {platformName}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        );
                      })}
                      {selectedExpert.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedExpert.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Experts;