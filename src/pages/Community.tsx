import { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Users, ExternalLink, MessageSquare, ThumbsUp, FileText, Linkedin, Instagram, Globe, Mail, Twitter, Youtube, Facebook, Hash, Podcast, Link, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/layout/Header';
import BadgeLegend from '@/components/community/BadgeLegend';
import { getBadgeByLevel, getProgressToNextLevel } from '@/constants/badges';
import { supabase } from '@/integrations/supabase/client';

interface CommunityMember {
  id: string;
  user_id: string;
  expertise_text?: string;
  expertise_area?: string; // Deprecated: kept for backward compatibility during migration
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
  social_media_links: Array<{ platform: string; url: string }> | unknown;
  total_contributions?: number;
  publication_reviews?: number;
  new_claims?: number;
  links_added?: number;
  contributor_level?: string;
  member_type?: 'expert' | 'researcher';
}

const Community = () => {
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [allMembers, setAllMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get expertise value (handles migration from expertise_area to expertise_text)
  const getExpertise = (member: CommunityMember): string => {
    return member.expertise_text || member.expertise_area || '';
  };

  const fetchCommunityMembers = useCallback(async () => {
    try {
      // Fetch from expert_stats_dev view (uses expertise_text column)
      const { data: membersData, error: membersError } = await supabase
        .from('expert_stats_dev')
        .select('*')

      if (membersError) throw membersError;

      const members = membersData || [];

      // Sort members to show experts first, then researchers
      const sortedMembers = (members as unknown as CommunityMember[]).sort((a, b) => {
        const aMemberType = a.member_type;
        const bMemberType = b.member_type;

        // Experts first (including fallback for existing data without member_type)
        if ((aMemberType === 'expert' || !aMemberType) && bMemberType === 'researcher') return -1;
        if (aMemberType === 'researcher' && (bMemberType === 'expert' || !bMemberType)) return 1;

        // Within same type, sort by display name or expertise text
        const aName = a.display_name || getExpertise(a);
        const bName = b.display_name || getExpertise(b);
        return aName.localeCompare(bName);
      });

      setAllMembers(sortedMembers);

    } catch (error) {
      console.error('Error fetching community members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityMembers();
  }, [fetchCommunityMembers]);

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

  const getContributorBadge = (member: CommunityMember) => {
    const level = member.contributor_level || 'Seedling';
    const badge = getBadgeByLevel(level);
    return {
      level: badge.level,
      emoji: badge.emoji,
      description: badge.description
    };
  };

  const openProfile = (member: CommunityMember) => {
    setSelectedMember(member);
  };

  const MemberCard = ({ member }: { member: CommunityMember }) => {
    const expertise = getExpertise(member);
    const displayName = member.display_name || `${expertise} ${member.member_type === 'expert' ? 'Expert' : 'Researcher'}`;
    const avatarUrl = member.profile_avatar_url || member.avatar_url;
    const title = expertise + ` ${member.member_type === 'expert' ? 'Specialist' : 'Researcher'}`;
    const yearsOnPlatform = getYearsOnPlatform(member.created_at);
    const contributorBadge = getContributorBadge(member);

    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer relative max-w-[240px] p-4"
        onClick={() => openProfile(member)}
      >
        {/* Experience Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <Badge variant="secondary" className="text-[11px] font-bold bg-primary/90 text-primary-foreground hover:bg-primary">
            {member.years_of_experience}y
          </Badge>
          <Badge variant="outline" className="text-[11px] font-bold bg-background/90 border-accent text-accent">
            {yearsOnPlatform}y
          </Badge>
        </div>

        {/* Member type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-[11px] font-bold text-primary  border-primary">
            {member.member_type === 'expert' ? 'Expert' : 'Researcher'}
          </Badge>
        </div>

        <CardHeader className="text-center pb-2 pt-2">
          <div className="relative w-14 h-14 mx-auto mb-2">
            <Avatar className="w-full h-full group-hover:scale-105 transition-transform duration-300">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-primary">
                {displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            {/* Contributor status dot at avatar bottom-right */}
            <div className="absolute -right-2 -bottom-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-lime-200 text-white text-[12px] shadow-sm border-2 border-white cursor-help">
                      <span className="leading-none">{contributorBadge.emoji}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-semibold">{contributorBadge.level}</p>
                    <p className="text-xs text-muted-foreground">{contributorBadge.description}</p>
                    <p className="text-xs mt-1">{member.total_contributions || 0} contributions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <CardTitle className="text-sm truncate">{displayName}</CardTitle>
          <CardDescription className="text-[12px] font-medium text-primary truncate">{title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-3">
          {member.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {member.location}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="secondary" className="text-xs">
              {expertise}
            </Badge>
          </div>
          <div className="flex gap-1 mt-2">
            {(() => {
              const links = (Array.isArray(member.social_media_links) ? member.social_media_links : []) as { platform: string; url: string }[];
              // Deduplicate by URL (trimmed) to avoid multiple identical icons
              const seen = new Set<string>();
              const uniqueLinks = links.filter(l => {
                const url = (l.url || '').trim();
                if (!url) return false;
                if (seen.has(url)) return false;
                seen.add(url);
                return true;
              });

              return uniqueLinks.map((link) => {
                if (!link.platform || !link.url) return null;
                const Icon = getSocialIcon(link.platform);
                // use url as key since it's unique after dedupe
                return (
                  <Button
                    key={link.url}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0"
                    onClick={(e) => e.stopPropagation()}
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-3 w-3" />
                    </a>
                  </Button>
                );
              });
            })()}
            {member.website && (
              <Button variant="ghost" size="icon" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()} asChild>
                <a href={member.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 pb-2 leading-[1.15] overflow-visible bg-hero-gradient bg-clip-text text-transparent">
              Our Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the experts and researchers who review, contribute, and guide our community with their expertise in women's health, wellness, and technology.
            </p>
          </div>

          {/* Community Members Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Community Members
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Info className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    <span className="sr-only">Contributor badge information</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="center">
                  <BadgeLegend />
                </PopoverContent>
              </Popover>
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading community members...</p>
              </div>
            ) : allMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No community members have been approved yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Community Member Profile Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (() => {
            const selectedExpertise = getExpertise(selectedMember);
            return (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedMember.profile_avatar_url || selectedMember.avatar_url} alt={selectedMember.display_name || `${selectedExpertise} ${selectedMember.member_type === 'expert' ? 'Expert' : 'Researcher'}`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
                      {selectedMember.display_name ? selectedMember.display_name.split(' ').map(n => n[0]).join('') : selectedExpertise.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <DialogTitle className="text-2xl">{selectedMember.display_name || `${selectedExpertise} ${selectedMember.member_type === 'expert' ? 'Expert' : 'Researcher'}`}</DialogTitle>
                      <Badge variant="outline">
                        {selectedMember.member_type === 'expert' ? 'Expert' : 'Researcher'}
                      </Badge>
                    </div>
                    <DialogDescription className="text-lg text-primary font-medium">
                      {selectedExpertise} {selectedMember.member_type === 'expert' ? 'Specialist' : 'Researcher'} • {getContributorBadge(selectedMember).description}
                    </DialogDescription>
                    {selectedMember.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        {selectedMember.location}
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contribution Stats */}
                {(() => {
                  const badge = getContributorBadge(selectedMember);
                  const totalContributions = selectedMember.total_contributions || 0;
                  const { progress, remaining, nextLevel } = getProgressToNextLevel(badge.level, totalContributions);
                  return (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-lime-200 text-xl">
                          {badge.emoji}
                        </div>
                        <div>
                          <p className="font-semibold">{badge.level}</p>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-2 rounded bg-background">
                          <p className="text-lg font-bold text-primary">{selectedMember.publication_reviews || 0}</p>
                          <p className="text-xs text-muted-foreground">Reviews</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background">
                          <p className="text-lg font-bold text-primary">{selectedMember.new_claims || 0}</p>
                          <p className="text-xs text-muted-foreground">Claims</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background">
                          <p className="text-lg font-bold text-primary">{selectedMember.links_added || 0}</p>
                          <p className="text-xs text-muted-foreground">Papers</p>
                        </div>
                      </div>

                      {nextLevel && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{totalContributions} contributions</span>
                            <span>{remaining} to {nextLevel.emoji} {nextLevel.level}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      {!nextLevel && (
                        <p className="text-xs text-center text-muted-foreground">🎉 Maximum level reached!</p>
                      )}
                    </div>
                  );
                })()}

                <Separator />

                {/* Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years of Experience</h4>
                    <p className="text-lg font-bold">{selectedMember.years_of_experience} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Years on Platform</h4>
                    <p className="text-lg font-bold">{getYearsOnPlatform(selectedMember.created_at)} years</p>
                  </div>
                </div>

                <Separator />

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold mb-3">Area of Expertise</h4>
                  <p className="text-muted-foreground">{selectedExpertise}</p>
                </div>

                <Separator />

                {/* Motivation */}
                <div>
                  <h4 className="font-semibold mb-3">Motivation</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedMember.motivation}</p>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3">Education & Background</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedMember.education}</p>
                </div>

                <Separator />

                {/* Social Links */}
                {((Array.isArray(selectedMember.social_media_links) && selectedMember.social_media_links.length > 0) || selectedMember.website) && (
                  <div>
                    <h4 className="font-semibold mb-3">Connect</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const links = (Array.isArray(selectedMember.social_media_links) ? selectedMember.social_media_links : []) as { platform: string; url: string }[];
                        const seen = new Set<string>();
                        const uniqueLinks = links.filter(l => {
                          const url = (l.url || '').trim();
                          if (!url) return false;
                          if (seen.has(url)) return false;
                          seen.add(url);
                          return true;
                        });

                        return uniqueLinks.map((link) => {
                          if (!link.platform || !link.url) return null;
                          const Icon = getSocialIcon(link.platform);
                          const platformName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                          return (
                            <Button key={link.url} variant="outline" size="sm" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <Icon className="h-4 w-4 mr-2" />
                                {platformName}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          );
                        });
                      })()}
                      {selectedMember.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedMember.website} target="_blank" rel="noopener noreferrer">
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
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
