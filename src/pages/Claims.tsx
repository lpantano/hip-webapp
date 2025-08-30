import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronUp, ExternalLink, Users, Info, Heart, Eye, BookOpen, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';

interface ClaimRow {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  product?: string | null;
  category: string; // nutrition | fitness | mental_heath | pregnancy | menopause | general_health | perimenopause
  condition?: string | null;
  stage?: string | null;
  vote_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PublicationRow {
  id: string;
  claim_id: string;
  title: string;
  journal?: string | null;
  publication_year?: number | null;
  doi?: string | null;
  url?: string | null;
  authors?: string | null;
  created_at: string;
}

interface PublicationScoreRow {
  id: string;
  publication_id: string;
  expert_user_id: string;
  category: string; // study_size | population | consensus | interpretation
  score: number;
  notes?: string | null;
}

interface ReactionRow {
  id: string;
  claim_id: string;
  user_id: string;
  reaction_type: string; // helpful | insightful | wantmore | moneysaver
  created_at: string;
}

interface VoteRow {
  id: string;
  claim_id: string;
  user_id: string;
  created_at: string;
}

interface ClaimUI {
  id: string;
  claim: string;
  // show the raw DB category value (e.g. 'nutrition', 'fitness', 'menopause', etc.)
  category: string;
  votes: number;
  publications: {
    title: string;
    authors: string;
    journal: string;
    year: number;
    url: string;
    scores: {
      sampleSize: { score: 'low' | 'medium' | 'high'; explanation: string };
      populationRepresentation: { score: 'low' | 'medium' | 'high'; explanation: string };
      consensus: { score: 'low' | 'medium' | 'high'; explanation: string };
      evidence: { score: 'low' | 'medium' | 'high'; explanation: string };
    };
  }[];
  status: 'pending' | 'under_review' | 'approved';
}

// We'll load claims from Supabase. The UI expects a specific shape so we map DB rows into that shape.

const Claims = () => {
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  // component-scoped Supabase client
  const sb = supabase;

  useEffect(() => {
    const mapScoreIntToLabel = (n: number): 'low' | 'medium' | 'high' => {
      if (n >= 4) return 'high';
      if (n === 3) return 'medium';
      return 'low';
    };

    const mapEvidenceRowToScores = (rows: PublicationScoreRow[] = []) => {
      const scoresTemplate: {
        sampleSize: { score: 'low' | 'medium' | 'high'; explanation: string };
        populationRepresentation: { score: 'low' | 'medium' | 'high'; explanation: string };
        consensus: { score: 'low' | 'medium' | 'high'; explanation: string };
        evidence: { score: 'low' | 'medium' | 'high'; explanation: string };
      } = {
        sampleSize: { score: 'low', explanation: '' },
        populationRepresentation: { score: 'low', explanation: '' },
        consensus: { score: 'low', explanation: '' },
        evidence: { score: 'low', explanation: '' }
      };

      (rows || []).forEach((r) => {
        const cat = r.category; // 'study_size' | 'population' | 'consensus' | 'interpretation'
        const label = mapScoreIntToLabel(r.score);
        if (cat === 'study_size') scoresTemplate.sampleSize = { score: label, explanation: r.notes || '' };
        else if (cat === 'population') scoresTemplate.populationRepresentation = { score: label, explanation: r.notes || '' };
        else if (cat === 'consensus') scoresTemplate.consensus = { score: label, explanation: r.notes || '' };
        else if (cat === 'interpretation') scoresTemplate.evidence = { score: label, explanation: r.notes || '' };
      });
      return scoresTemplate;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the `claims_full` view that aggregates publications (with scores) and claim_reactions
        const { data: joinedData, error: joinedError } = await sb.from('claims_full').select('*');

        if (joinedError) throw joinedError;

        const reactionsByClaim: Record<string, Record<string, number>> = {};

        type JoinedClaim = ClaimRow & {
          publications?: (PublicationRow & { publication_scores?: PublicationScoreRow[] })[];
          claim_reactions?: ReactionRow[];
        };

        const joined = (joinedData || []) as unknown as JoinedClaim[];
        const mappedClaims: ClaimUI[] = joined.map((c) => {
          // build reaction counts per claim from nested claim_reactions
          (c.claim_reactions || []).forEach((r) => {
            reactionsByClaim[r.claim_id] = reactionsByClaim[r.claim_id] || {};
            reactionsByClaim[r.claim_id][r.reaction_type] = (reactionsByClaim[r.claim_id][r.reaction_type] || 0) + 1;
          });

          // map nested publications and their scores
          const pubs = (c.publications || []).map((p: PublicationRow & { publication_scores?: PublicationScoreRow[] }) => {
            const scoresRows = p.publication_scores || [];
            const scores = mapEvidenceRowToScores(scoresRows);
            return {
              title: p.title,
              authors: p.authors || '',
              journal: p.journal || '',
              year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear()),
              url: p.url || p.doi || '',
              scores
            };
          });

          // map DB category directly to UI category (show DB value)
          const uiCategory: ClaimUI['category'] = c.category || '';

          const statusMap: Record<string, ClaimUI['status']> = {
            pending: 'pending',
            proposed: 'under_review',
            needs_more_evidence: 'under_review',
            verified: 'approved',
            disputed: 'under_review'
          };

          return {
            id: c.id,
            claim: c.title || c.description || '',
            category: uiCategory,
            votes: c.vote_count || 0,
            publications: pubs,
            status: statusMap[c.status] || 'pending'
          };
        });

        setClaims(mappedClaims);
        setReactions(reactionsByClaim);
      } catch (err) {
        console.error('Error loading claims:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sb]);

  // Persist votes to Supabase: toggle user's vote
  const handleVote = async (id: string) => {
    // optimistic UI update
    setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: claim.votes + 1 } : claim));

    try {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = (userResp as { user?: { id?: string } })?.user?.id;
      if (!userId) {
        // revert
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
        return;
      }

      // Check for existing vote
      const { data: existingVotes, error: voteErr } = await sb.from('claim_votes').select('*').eq('claim_id', id).eq('user_id', userId).limit(1).maybeSingle();
      if (voteErr) throw voteErr;

      if (existingVotes) {
        // user already voted -> remove vote
        const { error: delError } = await sb.from('claim_votes').delete().eq('claim_id', id).eq('user_id', userId);
        if (delError) throw delError;
        // update local state (decrement)
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
      } else {
        // insert vote
        const { error: insertError } = await sb.from('claim_votes').insert({ claim_id: id, user_id: userId });
        if (insertError) throw insertError;
        // vote_count trigger in DB will have incremented; we already optimistically incremented so nothing further to do
      }
    } catch (err) {
      console.error('Vote failed:', err);
      // revert optimistic increment
      setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
    }
  };

  const handleReaction = async (claimId: string, reactionType: string) => {
    // ensure reaction type matches DB allowed list
    const allowed = ['helpful', 'insightful', 'wantmore', 'moneysaver'];
    if (!allowed.includes(reactionType)) reactionType = 'insightful';

    // optimistic update
    setReactions(prev => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        [reactionType]: (prev[claimId]?.[reactionType] || 0) + 1
      }
    }));

    try {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = (userResp as { user?: { id?: string } })?.user?.id;
      if (!userId) return; // cannot persist without auth

      const { error } = await sb
        .from('claim_reactions')
        .insert({ claim_id: claimId, user_id: userId, reaction_type: reactionType });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to persist reaction', err);
      // revert optimistic update on failure
      setReactions(prev => ({
        ...prev,
        [claimId]: {
          ...prev[claimId],
          [reactionType]: Math.max(0, (prev[claimId]?.[reactionType] || 1) - 1)
        }
      }));
    }
  };

  const getReactionCount = (claimId: string, reactionType: string) => {
    return reactions[claimId]?.[reactionType] || 0;
  };

  const reactionButtons = [
    { type: 'helpful', icon: Heart, label: 'Helpful', color: 'text-pink-600' },
    { type: 'insightful', icon: Eye, label: 'Eye-opening', color: 'text-blue-600' },
    { type: 'wantmore', icon: BookOpen, label: 'Want more', color: 'text-green-600' },
    { type: 'moneysaver', icon: DollarSign, label: 'Money saver', color: 'text-yellow-600' }
  ];

  const humanize = (s?: string) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

  const getCategoryColor = (category: string) => {
    // Only map colors for DB-backed categories. Any unknown category falls back to neutral styling.
    const colors: Record<string, string> = {
      nutrition: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      fitness: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      mental_heath: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pregnancy: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      menopause: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      general_health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      perimenopause: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };

    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[score];
  };

  const sortedClaims = [...claims].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    return 0; // For 'recent' we'd sort by date when we have real data
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Claims for Review
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Community-driven claims about products and services for women's health conditions. 
              Upvote Claims with strong scientific backing to prioritize them for expert review.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>All Claims must be linked to scientific publications</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'votes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('votes')}
                >
                  Sort by Votes
                </Button>
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Most Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="max-w-4xl mx-auto space-y-6">
            {sortedClaims.map((claim) => (
              <Card key={claim.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getCategoryColor(claim.category)}>
                          {humanize(claim.category)}
                        </Badge>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{claim.claim}</CardTitle>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(claim.id)}
                        className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ChevronUp className="w-4 h-4" />
                        {claim.votes}
                      </Button>
                      
                      {/* Reaction buttons */}
                      <div className="flex flex-col gap-1 mt-2">
                        {reactionButtons.map((reaction) => {
                          const count = getReactionCount(claim.id, reaction.type);
                          const Icon = reaction.icon;
                          return (
                            <Button
                              key={reaction.type}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs justify-start"
                              onClick={() => handleReaction(claim.id, reaction.type)}
                              title={reaction.label}
                            >
                              <Icon className={`w-3 h-3 mr-1 ${reaction.color}`} />
                              <span className="text-xs">{count > 0 && count}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      Supporting Publications
                    </h4>
                    <div className="space-y-3">
                      {claim.publications.map((pub, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{pub.title}</h5>
                              <p className="text-xs text-muted-foreground mb-1">
                                {pub.authors} • {pub.journal} ({pub.year})
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="shrink-0"
                            >
                              <a 
                                href={pub.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </a>
                            </Button>
                          </div>
                          
                          {/* Score Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Sample Size:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.sampleSize.score)} variant="outline">
                                      {pub.scores.sampleSize.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Sample Size Score</div>
                                     <p>{pub.scores.sampleSize.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Population:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.populationRepresentation.score)} variant="outline">
                                      {pub.scores.populationRepresentation.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Population Representation</div>
                                     <p>{pub.scores.populationRepresentation.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Consensus:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.consensus.score)} variant="outline">
                                      {pub.scores.consensus.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Research Consensus</div>
                                     <p>{pub.scores.consensus.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Evidence:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.evidence.score)} variant="outline">
                                      {pub.scores.evidence.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Evidence Quality</div>
                                     <p>{pub.scores.evidence.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Want to Submit an Claims?</h3>
                <p className="text-muted-foreground mb-6">
                  Have a claim backed by scientific research? Submit it for community review and expert evaluation.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Submit Claims
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Claims;