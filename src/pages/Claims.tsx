import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ExternalLink, Users, Info, Heart, Eye, BookOpen, DollarSign, Plus, Filter, FileText, Shield, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import ExpertScoreDistribution from '@/components/ui/expert-score-distribution';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourcesSection } from '@/components/resources/ResourcesSection';
import type { Database } from '@/integrations/supabase/types';

interface ClaimRow {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  product?: string | null;
  category: Database['public']['Enums']['claim_category'];
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
  // Consolidated schema: one row per publication+expert
  evidence_classification?: 'unreliable_study' | 'not_tested_in_human' | 'limited_tested_in_human' | 'widely_tested_in_human' | 'widely_scientifically_accepted' | null;
  alignment?: number | null; // interpretation
  study_size?: number | null;
  population?: number | null;
  consensus?: number | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
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

interface ClaimCommentRow {
  id: string;
  claim_id: string;
  expert_user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ClaimUI {
  id: string;
  claim: string;
  // show the raw DB category value (e.g. 'nutrition', 'fitness', 'menopause', etc.)
  category: Database['public']['Enums']['claim_category'];
  votes: number;
  publications: {
    id: string; // Add publication ID
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
    // raw individual score rows so we can detect if current expert already reviewed
    rawScores?: PublicationScoreRow[];
  }[];
  comments?: ClaimCommentRow[];
  status: 'pending' | 'under_review' | 'approved' | 'reviewed';
}

interface ExpertDistribution {
  category: string;
  categoryLabel: string;
  totalExperts: number;
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// We'll load claims from Supabase. The UI expects a specific shape so we map DB rows into that shape.

const Claims = () => {
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [filterByCategory, setFilterByCategory] = useState<Database['public']['Enums']['claim_category'] | 'all'>('all');
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertDistributions, setExpertDistributions] = useState<Record<string, ExpertDistribution[]>>({});
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [claimComments, setClaimComments] = useState<Record<string, ClaimCommentRow[]>>({});
  const { user } = useAuth();

  // component-scoped Supabase client
  const sb = supabase;

  // Check if user is expert
  const [isExpert, setIsExpert] = useState(false);
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpert(false);
        return;
      }
      
      try {
        const { data } = await sb.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'expert' 
        });
        setIsExpert(data || false);
      } catch (error) {
        console.error('Error checking expert status:', error);
        setIsExpert(false);
      }
    };
    
    checkExpertStatus();
  }, [user, sb]);

  const mapScoreIntToLabel = useCallback((n: number): 'low' | 'medium' | 'high' => {
    // New schema uses 1..3 where 1=low,2=medium,3=high
    if (n >= 3) return 'high';
    if (n === 2) return 'medium';
    return 'low';
  }, []);

  const mapEvidenceRowToScores = useCallback((rows: PublicationScoreRow[] = []) => {
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

    if (!rows || rows.length === 0) return scoresTemplate;

    // If rows represent consolidated rows (one per expert), pick the most recent expert row to populate the summary display
    // (This mirrors previous behaviour where the first matching rows were used). For aggregated views consider using distributions.
    const latestRow = rows.reduce((a, b) => {
      const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bTime >= aTime ? b : a;
    }, rows[0]);

    if (latestRow) {
      if (typeof latestRow.study_size === 'number') scoresTemplate.sampleSize = { score: mapScoreIntToLabel(latestRow.study_size), explanation: latestRow.comments || '' };
      if (typeof latestRow.population === 'number') scoresTemplate.populationRepresentation = { score: mapScoreIntToLabel(latestRow.population), explanation: latestRow.comments || '' };
      if (typeof latestRow.consensus === 'number') scoresTemplate.consensus = { score: mapScoreIntToLabel(latestRow.consensus), explanation: latestRow.comments || '' };
      if (typeof latestRow.alignment === 'number') scoresTemplate.evidence = { score: mapScoreIntToLabel(latestRow.alignment), explanation: latestRow.comments || '' };
    }

    return scoresTemplate;
  }, [mapScoreIntToLabel]);

  const fetchExpertDistributions = useCallback(async () => {
    try {
      // Fetch consolidated score data and create distributions from individual columns
      const { data: scoreData, error } = await sb.from('publication_scores')
        .select(`
          alignment,
          study_size,
          population,
          consensus,
          publication_id,
          publications!inner(claim_id)
        `);
      
      if (error) throw error;

      // Process the consolidated data to create distributions
      const distributionMap: Record<string, Record<string, { low: number; medium: number; high: number; }>> = {};
      
      type ScoreItem = { 
        alignment?: number | null; 
        study_size?: number | null; 
        population?: number | null; 
        consensus?: number | null; 
        publication_id?: string;
        publications?: { claim_id?: string } | Array<{ claim_id?: string }> | null;
      };
      
      const rows = (scoreData || []) as ScoreItem[];
      rows.forEach((itemRaw) => {
        // Supabase can return the related row as an object or an array depending on the join shape.
        let claimId: string | undefined;
        if (itemRaw.publications) {
          if (Array.isArray(itemRaw.publications)) {
            claimId = itemRaw.publications[0]?.claim_id || undefined;
          } else {
            claimId = itemRaw.publications?.claim_id || undefined;
          }
        }

        // If claimId not present, we cannot attribute this score to a claim so skip it.
        if (!claimId) return;
        
        if (!distributionMap[claimId]) {
          distributionMap[claimId] = {};
        }
        
        // Process each score category from the consolidated row
        const categories = [
          { key: 'interpretation', value: itemRaw.alignment },
          { key: 'study_size', value: itemRaw.study_size },
          { key: 'population', value: itemRaw.population },
          { key: 'consensus', value: itemRaw.consensus }
        ];
        
        categories.forEach(({ key, value }) => {
          if (typeof value === 'number') {
            if (!distributionMap[claimId][key]) {
              distributionMap[claimId][key] = { low: 0, medium: 0, high: 0 };
            }
            
            // Map score to level using new 1-3 scale
            const scoreLevel = mapScoreIntToLabel(value);
            distributionMap[claimId][key][scoreLevel]++;
          }
        });
      });

      // Convert to the format expected by the component
      const distributions: Record<string, ExpertDistribution[]> = {};
      
      Object.entries(distributionMap).forEach(([claimId, categories]) => {
        distributions[claimId] = Object.entries(categories).map(([category, dist]) => {
          const totalExperts = dist.low + dist.medium + dist.high;
          
          const categoryLabels: Record<string, string> = {
            'study_size': 'Sample Size',
            'population': 'Population',
            'consensus': 'Consensus'
            // 'interpretation' (Evidence Quality) intentionally omitted from distributions
          };
          
          return {
            category,
            categoryLabel: categoryLabels[category] || category,
            totalExperts,
            distribution: dist
          };
        });
      });

      setExpertDistributions(distributions);
    } catch (error) {
      console.error('Error fetching expert distributions:', error);
    }
  }, [sb, mapScoreIntToLabel]);

  const fetchClaimsData = useCallback(async () => {
    try {
      // Fetch claims directly instead of using the problematic view
      const { data: claimsData, error: claimsError } = await sb.from('claims').select('*');
      if (claimsError) throw claimsError;

      // Fetch all publications for these claims
      const claimIds = claimsData?.map(c => c.id) || [];
      const { data: publicationsData, error: publicationsError } = await sb
        .from('publications')
        .select('*')
        .in('claim_id', claimIds);
      if (publicationsError) throw publicationsError;

      // Fetch all reactions for these claims
      const { data: reactionsData, error: reactionsError } = await sb
        .from('claim_reactions')
        .select('*')
        .in('claim_id', claimIds);
      if (reactionsError) throw reactionsError;

      // Fetch claim comments
      const { data: commentsData, error: commentsError } = await sb
        .from('claim_comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Build reaction counts from the fetched reactions data
      const reactionsByClaim: Record<string, Record<string, number>> = {};
      (reactionsData || []).forEach((reaction: ReactionRow) => {
        if (!reactionsByClaim[reaction.claim_id]) {
          reactionsByClaim[reaction.claim_id] = {};
        }
        reactionsByClaim[reaction.claim_id][reaction.reaction_type] = (reactionsByClaim[reaction.claim_id][reaction.reaction_type] || 0) + 1;
      });

      // Fetch user's own reactions using the same data we already fetched
      const userReactionsByClaim: Record<string, Set<string>> = {};
      if (user) {
        const userReactionsForClaims = (reactionsData || []).filter(r => r.user_id === user.id);
        userReactionsForClaims.forEach((reaction) => {
          if (!userReactionsByClaim[reaction.claim_id]) {
            userReactionsByClaim[reaction.claim_id] = new Set();
          }
          userReactionsByClaim[reaction.claim_id].add(reaction.reaction_type);
        });
      }

      // Group publications by claim_id
      const publicationsByClaim: Record<string, PublicationRow[]> = {};
      (publicationsData || []).forEach((pub: PublicationRow) => {
        if (!publicationsByClaim[pub.claim_id]) {
          publicationsByClaim[pub.claim_id] = [];
        }
        publicationsByClaim[pub.claim_id].push(pub);
      });

      // Group comments by claim_id
      const commentsByClaim: Record<string, ClaimCommentRow[]> = {};
      (commentsData || []).forEach((comment: ClaimCommentRow) => {
        if (!commentsByClaim[comment.claim_id]) {
          commentsByClaim[comment.claim_id] = [];
        }
        commentsByClaim[comment.claim_id].push(comment);
      });

      const mappedClaims: ClaimUI[] = (claimsData || []).map((c: ClaimRow) => {
        // map publications for this claim
        const claimPublications = publicationsByClaim[c.id] || [];
        const pubs = claimPublications.map((p: PublicationRow) => {
          return {
            id: p.id, // Add publication ID
            title: p.title,
            authors: p.authors || '',
            journal: p.journal || '',
            year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear()),
            url: p.url || p.doi || '',
            scores: {
              sampleSize: { score: 'low' as const, explanation: '' },
              populationRepresentation: { score: 'low' as const, explanation: '' },
              consensus: { score: 'low' as const, explanation: '' },
              evidence: { score: 'low' as const, explanation: '' }
            },
            // Will be populated later with actual scores
            rawScores: []
          };
        });

        const statusMap: Record<string, ClaimUI['status']> = {
          pending: 'pending',
          proposed: 'under_review',
          needs_more_evidence: 'under_review',
          verified: 'approved',
          disputed: 'under_review',
          reviewed: 'reviewed'
        };

        return {
          id: c.id,
          claim: c.title || c.description || '',
          category: c.category,
          votes: c.vote_count || 0,
          publications: pubs,
          comments: commentsByClaim[c.id] || [],
          status: statusMap[c.status] || 'pending'
        };
      });

      setClaims(mappedClaims);
      setReactions(reactionsByClaim);
      setUserReactions(userReactionsByClaim);
      setClaimComments(commentsByClaim);

      // Fetch publication scores and attach to publications
      try {
        const pubIds = mappedClaims.flatMap(c => c.publications.map(p => p.id));
        if (pubIds.length > 0) {
          const { data: scoreRows, error: scoreErr } = await sb
            .from('publication_scores')
            .select('*')
            .in('publication_id', pubIds as string[]);

          if (!scoreErr && scoreRows) {
            const scoreRowsTyped = scoreRows as PublicationScoreRow[];
            const scoreMap: Record<string, PublicationScoreRow[]> = {};
            scoreRowsTyped.forEach((r) => {
              if (!scoreMap[r.publication_id]) scoreMap[r.publication_id] = [];
              scoreMap[r.publication_id].push(r);
            });

            const updatedClaims = mappedClaims.map((cl) => ({
              ...cl,
              publications: cl.publications.map((pub) => {
                const rows = scoreMap[pub.id] || pub.rawScores || [];
                return {
                  ...pub,
                  rawScores: rows,
                  scores: mapEvidenceRowToScores(rows)
                };
              })
            }));

            setClaims(updatedClaims);

            // fetch expert profiles for score authors
            const expertIdsSet = new Set<string>();
            scoreRowsTyped.forEach((r) => {
              if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
            });

            const expertIds = Array.from(expertIdsSet);
            if (expertIds.length > 0) {
              const { data: statsRows, error: statsErr } = await sb
                .from('expert_stats')
                .select('user_id, display_name, avatar_url')
                .in('user_id', expertIds as string[]);

              if (!statsErr && statsRows) {
                const statsMap: Record<string, { display_name?: string | null; avatar_url?: string | null }> = {};
                (statsRows as unknown[]).forEach((r) => {
                  if (!r || typeof r !== 'object') return;
                  const rec = r as Record<string, unknown>;
                  const key = typeof rec.user_id === 'string' ? rec.user_id : null;
                  if (!key) return;
                  const display = typeof rec.display_name === 'string' ? rec.display_name : null;
                  const avatar = typeof rec.avatar_url === 'string' ? rec.avatar_url : null;
                  statsMap[key] = { display_name: display, avatar_url: avatar };
                });
                setExpertProfiles(prev => ({ ...prev, ...statsMap }));
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load publication_scores', e);
      }
    } catch (err) {
      console.error('Error loading claims:', err);
    }
  }, [sb, mapEvidenceRowToScores, user]);

  // Static data for pre-release
  const getStaticClaimsData = useCallback(() => {
    const staticClaims: ClaimUI[] = [
      {
        id: 'static-turmeric-1',
        claim: 'Turmeric decreases visceral fat',
        category: 'nutrition',
        votes: 42,
        publications: [
          {
            id: 'pub-turmeric-1',
            title: 'Curcumin supplementation and vascular and cognitive function in chronic kidney disease: a randomized controlled trial',
            authors: 'Ng QX, Koh SSH, Chan HW, Ho CYX',
            journal: 'PubMed',
            year: 2021,
            url: 'https://pubmed.ncbi.nlm.nih.gov/33880847/',
            scores: {
              sampleSize: { score: 'low', explanation: 'Small sample size in animal study' },
              populationRepresentation: { score: 'low', explanation: 'Study conducted in male mice, not representative of human population' },
              consensus: { score: 'low', explanation: 'Limited research available, not yet replicated' },
              evidence: { score: 'low', explanation: 'Animal study only, not tested in humans' }
            },
            rawScores: [
              {
                id: 'score-1',
                publication_id: 'pub-turmeric-1',
                expert_user_id: 'expert-lorena',
                evidence_classification: 'not_tested_in_human' as const,
                alignment: 1, // bad alignment - animal study
                study_size: 1, // low - small sample
                population: 1, // low - male mice only
                consensus: 1, // low - limited research
                created_at: '2024-09-20T10:00:00Z',
                updated_at: '2024-09-20T10:00:00Z'
              }
            ]
          }
        ],
        comments: [
          {
            id: 'comment-1',
            claim_id: 'static-turmeric-1',
            expert_user_id: 'expert-lorena',
            content: 'New research, not reproduced yet. Study done in male mice, not tested in humans.',
            created_at: '2024-09-20T10:00:00Z',
            updated_at: '2024-09-20T10:00:00Z'
          }
        ],
        status: 'reviewed' as const
      }
    ];

    // Set static expert profile
    setExpertProfiles({
      'expert-lorena': {
        display_name: 'Lorena Pantano',
        avatar_url: null
      }
    });

    // Set static expert distributions
    const staticDistributions: Record<string, ExpertDistribution[]> = {
      'static-turmeric-1': [
        {
          category: 'study_size',
          categoryLabel: 'Sample Size',
          totalExperts: 1,
          distribution: { low: 1, medium: 0, high: 0 }
        },
        {
          category: 'population',
          categoryLabel: 'Population',
          totalExperts: 1,
          distribution: { low: 1, medium: 0, high: 0 }
        },
        {
          category: 'consensus',
          categoryLabel: 'Consensus',
          totalExperts: 1,
          distribution: { low: 1, medium: 0, high: 0 }
        }
      ]
    };

    setClaims(staticClaims);
    setExpertDistributions(staticDistributions);
    setClaimComments({
      'static-turmeric-1': staticClaims[0].comments || []
    });

    // Set static reactions
    setReactions({
      'static-turmeric-1': {
        'helpful': 15,
        'insightful': 8,
        'wantmore': 12,
        'moneysaver': 5
      }
    });

    setUserReactions({});
  }, []);

  // Move fetchData outside useEffect so it can be called from form submission
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Use static data for pre-release instead of fetching from database
      getStaticClaimsData();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [getStaticClaimsData]);

  // Ensure data is loaded on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

    const refreshCountsForClaim = async (cId: string) => {
      try {
        const { data: rows, error } = await sb.from('claim_reactions').select('reaction_type').eq('claim_id', cId);
        if (error) throw error;
        const counts: Record<string, number> = {};
        (rows || []).forEach((r: { reaction_type: string }) => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        });
        setReactions(prev => ({ ...prev, [cId]: counts }));

        // Also refresh user's own reactions for this claim
        if (user) {
          const { data: userRows, error: userError } = await sb
            .from('claim_reactions')
            .select('reaction_type')
            .eq('claim_id', cId)
            .eq('user_id', user.id);

          if (!userError && userRows) {
            const userReactionTypes = new Set(userRows.map(r => r.reaction_type));
            setUserReactions(prev => ({ ...prev, [cId]: userReactionTypes }));
          }
        }
      } catch (e) {
        console.error('Failed to refresh reaction counts', e);
      }
    };

    try {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = (userResp as { user?: { id?: string } })?.user?.id;
      if (!userId) {
        console.warn('User not authenticated, cannot persist reaction');
        return;
      }

      // Check for existing reaction by this user for this claim + type
      const { data: existing, error: existingErr } = await sb
        .from('claim_reactions')
        .select('id')
        .eq('claim_id', claimId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .limit(1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existing) {
        // remove existing reaction
        const { error: delErr } = await sb.from('claim_reactions').delete().eq('id', existing.id);
        if (delErr) throw delErr;
        await refreshCountsForClaim(claimId);
      } else {
        // insert reaction
        const { error: insertErr } = await sb
          .from('claim_reactions')
          .insert({ claim_id: claimId, user_id: userId, reaction_type: reactionType });

        if (insertErr) {
          // unique-constraint race or similar - refresh counts to reflect actual state
          if ((insertErr as unknown as { code?: string })?.code === '23505') {
            await refreshCountsForClaim(claimId);
            return;
          }
          throw insertErr;
        }

        // success - refresh counts to show accurate numbers
        await refreshCountsForClaim(claimId);
      }
    } catch (err) {
      console.error('Failed to persist reaction', err);
    }
  };

  const getReactionCount = (claimId: string, reactionType: string) => {
    return reactions[claimId]?.[reactionType] || 0;
  };

  const hasUserReacted = (claimId: string, reactionType: string) => {
    return userReactions[claimId]?.has(reactionType) || false;
  };

  const reactionButtons = [
    { type: 'helpful', icon: Heart, label: 'Helpful', color: 'text-pink-600' },
    { type: 'insightful', icon: Eye, label: 'Eye-opening', color: 'text-blue-600' },
    { type: 'wantmore', icon: BookOpen, label: 'Want more', color: 'text-green-600' },
    { type: 'moneysaver', icon: DollarSign, label: 'Money saver', color: 'text-yellow-600' }
  ];

  const humanize = (s?: string) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

  const getCategoryColor = (category: Database['public']['Enums']['claim_category'] | string) => {
    // Only map colors for DB-backed categories. Any unknown category falls back to neutral styling.
    const colors: Record<string, string> = {
      nutrition: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      fitness: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      mental_health: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      reviewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: 'low' | 'medium' | 'high', hasScore: boolean = true) => {
    if (!hasScore) {
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
    const colors = {
      low: 'bg-blue-50 text-blue-500 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white'
    };
    return colors[score];
  };

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'study_size': 'Sample Size',
      'population': 'Population', 
      'consensus': 'Consensus'
      // 'interpretation' (Evidence Quality) intentionally omitted from publication score labels
    };
    return labels[category] || category;
  };

  // Individual expert review cards
  type ExpertReviewCard = {
    publication: {
      id: string;
      title: string;
      journal: string;
      year: number;
      authors: string;
    };
    expert: {
      expert_user_id: string;
      display_name?: string | null;
      avatar_url?: string | null;
      // Show the current scores for each category; score may be null when not provided
      scores: Array<{
        category: string;
        score?: 'low' | 'medium' | 'high' | null;
      }>;
      comments: Array<{
        content: string;
        created_at: string;
      }>;
      classification?: string | null;
    };
  };

  const ExpertReviewsReel: React.FC<{ reviewCards: ExpertReviewCard[] }> = ({ reviewCards }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    if (!reviewCards || reviewCards.length === 0) {
      return <div className="text-sm text-muted-foreground">No reviews yet for this claim.</div>;
    }

    return (
      <div className="relative">
        <div
          ref={containerRef}
          className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] p-2"
          role="list"
          aria-label="Expert reviews"
        >
          {reviewCards.map((reviewCard, index) => (
            <div key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`} className="bg-background border border-border rounded-lg p-4 shadow-sm">
              {/* Expert Header */}
              <div className="flex items-center gap-3 mb-3">
                {reviewCard.expert.avatar_url ? (
                  <img 
                    src={reviewCard.expert.avatar_url} 
                    alt={reviewCard.expert.display_name || 'Expert'} 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-sm flex items-center justify-center"
                  style={{ display: reviewCard.expert.avatar_url ? 'none' : 'flex' }}
                >
                  {(reviewCard.expert.display_name || 'E').split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div className="font-semibold text-sm">{reviewCard.expert.display_name || 'Expert'}</div>
                  <div className="text-xs text-muted-foreground">Expert Review</div>
                  {reviewCard.expert.classification && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Publication Info */}
              <div className="mb-4 pb-3 border-b border-border">
                <h4 className="font-semibold text-sm mb-1">{reviewCard.publication.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {reviewCard.publication.authors} • {reviewCard.publication.journal} ({reviewCard.publication.year})
                </p>
              </div>

              {/* Scores */}
              {reviewCard.expert.scores.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {reviewCard.expert.scores.map((scoreItem, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">{getCategoryLabel(scoreItem.category)}:</span>
                          <Badge className={`text-xs px-2 py-1 ${getScoreColor(scoreItem.score ?? 'low', !!scoreItem.score)}`}>
                            {scoreItem.score ? scoreItem.score : 'No score'}
                          </Badge>
                        </div>
                        {/* per-score notes removed: only one comment per card now */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {reviewCard.expert.comments.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Comments:</div>
                  <div className="space-y-2">
                    {reviewCard.expert.comments.map((comment, idx) => (
                      <div key={idx} className="bg-muted/20 p-3 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm">"{comment.content}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'menopause', label: 'Menopause' },
    { value: 'perimenopause', label: 'Perimenopause' },
    { value: 'general_health', label: 'General Health' }
  ];

  const filteredAndSortedClaims = [...claims]
    .filter(claim => filterByCategory === 'all' || claim.category === filterByCategory)
    .sort((a, b) => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6  bg-hero-gradient bg-clip-text text-transparent">
              Community Reviewed Claims
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Community-driven claims about products and services for women's health conditions. 
              Upvote Claims with strong scientific backing to prioritize them for expert review.
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="claims" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="trusted-resources">Trusted Resources</TabsTrigger>
            </TabsList>

            {/* Claims Tab */}
            <TabsContent value="claims" className="space-y-6">
              {/* Claims Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>All Claims must be linked to scientific publications</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2" disabled={true}>
                        <Plus className="w-4 h-4" />
                        Submit New Claim (Disabled for Demo)
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <ClaimSubmissionForm 
                        onSuccess={() => {
                          setShowSubmissionForm(false);
                          // Refresh the claims data by re-running the fetch
                          fetchData();
                        }}
                        onCancel={() => setShowSubmissionForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Select value={filterByCategory} onValueChange={(value) => setFilterByCategory(value as typeof filterByCategory)}>
                    <SelectTrigger className="w-[180px] h-9">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
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
              {filteredAndSortedClaims.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No claims found for the selected category.</p>
                </div>
              )}
              {filteredAndSortedClaims.map((claim) => (
              <Card key={claim.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleClaimExpansion(claim.id)}>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <Badge className={getCategoryColor(claim.category)}>
                          {humanize(claim.category)}
                        </Badge>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                        {claim.claim}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {expandedClaim === claim.id ? '▼' : '▶'}
                        </span>
                      </CardTitle>
                      {/* Source Information */}
                      <div className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Source:</span> Dr. Mary Claire Haver - The 'Pause Nutrition Turmeric Supplement - 'Pause Blog, Turmeric 101
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(claim.id)}
                        className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ChevronUp className="w-4 h-4" />
                        {claim.votes}
                      </Button>

                      {/* Reaction buttons: moved to the right and rendered horizontally under the vote button */}
                      <div className="flex items-center gap-2 mt-1">
                        {reactionButtons.map((reaction) => {
                          const count = getReactionCount(claim.id, reaction.type);
                          const hasReacted = hasUserReacted(claim.id, reaction.type);
                          const Icon = reaction.icon;
                          return (
                            <Button
                              key={reaction.type}
                              variant="ghost"
                              size="sm"
                              className={`h-7 px-2 text-xs flex items-center gap-1 ${hasReacted ? 'bg-muted' : ''}`}
                              onClick={() => handleReaction(claim.id, reaction.type)}
                              title={reaction.label}
                              disabled={!user}
                            >
                              <Icon className={`w-4 h-4 ${hasReacted ? reaction.color : 'text-muted-foreground'} ${hasReacted ? 'fill-current' : ''}`} />
                              <span className="text-xs font-medium">{count}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expert Score Distributions */}
                  {/* {expertDistributions[claim.id] && (
                    <ExpertScoreDistribution distributions={expertDistributions[claim.id]} />
                  )} */}

                  {/* Expert Reviews Summary */}
                  {claim.publications.length > 0 && claim.publications.some(pub => pub.rawScores && pub.rawScores.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Expert Reviews:</div>
                      <div className="flex flex-wrap gap-2">
                        {claim.publications.map(pub => 
                          pub.rawScores?.map((score, idx) => {
                            const expertProfile = expertProfiles[score.expert_user_id];
                            return (
                              <div key={`${pub.id}-${score.expert_user_id}-${idx}`} className="flex items-center gap-2 bg-muted/20 rounded-md p-2">
                                {expertProfile?.avatar_url ? (
                                  <img 
                                    src={expertProfile.avatar_url} 
                                    alt={expertProfile.display_name || 'Expert'} 
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      if (target.nextElementSibling) {
                                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-xs flex items-center justify-center"
                                  style={{ display: expertProfile?.avatar_url ? 'none' : 'flex' }}
                                >
                                  {(expertProfile?.display_name || 'E').split(' ').map(n => n[0]).slice(0,2).join('')}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">{expertProfile?.display_name || 'Expert'}</span>
                                  {score.evidence_classification && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0.5 h-auto">
                                      {score.evidence_classification.replace(/_/g, ' ').split(' ').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ).flat()}
                      </div>
                    </div>
                  )}
                </CardHeader>

                {/* Expanded view with individual reviews */}
                {expandedClaim === claim.id && (
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                        Individual Expert Reviews
                      </h4>
                      <div className="space-y-4">
                        {claim.publications.map((pub, pubIndex) => (
                          <div key={pubIndex} className="bg-muted/20 rounded-md p-3">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm mb-1">{pub.title}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {pub.authors} • {pub.journal} ({pub.year})
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isExpert && (() => {
                                  const existingReview = pub.rawScores?.find(rs => rs.expert_user_id === user?.id) || null;
                                  const reviewButtonText = existingReview ? 'Update Review' : 'Review';
                                  return (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setReviewPublication({
                                        id: pub.id || '',
                                        title: pub.title,
                                        journal: pub.journal,
                                        publication_year: pub.year,
                                        authors: pub.authors,
                                        url: pub.url,
                                        existingReview
                                      })}
                                      className="shrink-0 text-xs"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      {reviewButtonText}
                                    </Button>
                                  );
                                })()}
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
                            </div>

                            {/* Reviewer details moved to the Expert Reviews Reel below to avoid duplication. */}
                            <div className="text-xs text-muted-foreground">Reviewer scores and comments are available in the "Expert Reviews Reel" below.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Add Paper Button - Always visible */}
                <CardContent className="pt-2">
                  {user && (
                    <div className="border-t border-border pt-3 flex flex-wrap items-center gap-3">
                      {/* SEE FULL REVIEW first and highlighted */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowReelClaim(claim.id)}
                        className="flex items-center gap-2 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        See Full Review
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPaperForm(claim.id)}
                        className="flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Add Supporting Paper
                      </Button>
                    </div>
                  )}
                </CardContent>

                {/* ReelsCarousel for expert reviews - moved to dialog. Do not render inline when card is expanded. */}
                {/* The full review reel is available via the 'See Full Review' button which opens the dialog. */}
              </Card>
            ))}
            </TabsContent>

            <TabsContent value="trusted-resources" className="space-y-6">
              <ResourcesSection />
            </TabsContent>
          </Tabs>

          {/* Paper Submission Dialog */}
          {showPaperForm && (
            <Dialog open={!!showPaperForm} onOpenChange={() => setShowPaperForm(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showPaperForm);
                  return claim ? (
                    <PaperSubmissionForm
                      claimId={claim.id}
                      claimTitle={claim.claim}
                      onSuccess={() => {
                        setShowPaperForm(null);
                        fetchData();
                      }}
                      onCancel={() => setShowPaperForm(null)}
                    />
                  ) : null;
                })()}
              </DialogContent>
            </Dialog>
          )}

          {/* Expert Reviews Reel Dialog */}
          <Dialog open={!!showReelClaim} onOpenChange={() => setShowReelClaim(null)}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              {(() => {
                const claim = filteredAndSortedClaims.find(c => c.id === showReelClaim);
                if (!claim) return <div className="text-center text-sm text-muted-foreground">No reviews available.</div>;
                
                // Create individual cards for each expert review on each publication
                const reviewCards: ExpertReviewCard[] = [];
                
                claim.publications.forEach(pub => {
                  // Group scores by expert
                  const scoresByExpert: Record<string, PublicationScoreRow[]> = {};
                  (pub.rawScores || []).forEach(score => {
                    if (!scoresByExpert[score.expert_user_id]) {
                      scoresByExpert[score.expert_user_id] = [];
                    }
                    scoresByExpert[score.expert_user_id].push(score);
                  });

                  // Get comments for this claim
                  const claimCommentsForClaim = claim.comments || [];

                  // Create individual cards for each expert who reviewed this publication
                  Object.entries(scoresByExpert).forEach(([expertUserId, scores]) => {
                    const expertProfile = expertProfiles[expertUserId];
                    const expertComments = claimCommentsForClaim.filter(comment => comment.expert_user_id === expertUserId);
                    
                    // For consolidated schema, pick the latest row for this expert (there should be one)
                    const latestRow = (scores || []).reduce((a, b) => {
                      const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
                      const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
                      return bTime >= aTime ? b : a;
                    }, scores[0]);

                    // Exclude 'interpretation' (Evidence Quality) from per-publication score lists — it's shown as a card-level label
                    const expertScores: Array<{ category: string; score?: 'low' | 'medium' | 'high' | null }> = [
                      { category: 'study_size', score: latestRow && typeof latestRow.study_size === 'number' ? mapScoreIntToLabel(latestRow.study_size) : null },
                      { category: 'population', score: latestRow && typeof latestRow.population === 'number' ? mapScoreIntToLabel(latestRow.population) : null },
                      { category: 'consensus', score: latestRow && typeof latestRow.consensus === 'number' ? mapScoreIntToLabel(latestRow.consensus) : null }
                    ];

                    // Merge comments: claim-level expert comments + the review's comments (if present)
                    const mergedComments = [
                      ...expertComments.map(c => ({ content: c.content, created_at: c.created_at })),
                    ];
                    if (latestRow?.comments) mergedComments.push({ content: latestRow.comments, created_at: latestRow.updated_at || latestRow.created_at || '' });
                    // if (latestRow?.evidence_classification) mergedComments.push({ content: `Classification: ${latestRow.evidence_classification}`, created_at: latestRow.updated_at || latestRow.created_at || '' });

                    reviewCards.push({
                      publication: {
                        id: pub.id,
                        title: pub.title,
                        journal: pub.journal,
                        year: pub.year,
                        authors: pub.authors
                      },
                      expert: {
                        expert_user_id: expertUserId,
                        display_name: expertProfile?.display_name,
                        avatar_url: expertProfile?.avatar_url,
                        scores: expertScores,
                        comments: mergedComments,
                        classification: latestRow?.evidence_classification ?? null
                      }
                    });
                  });
                });

                return (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{claim.claim} — Individual Expert Reviews</h3>
                    <ExpertReviewsReel reviewCards={reviewCards} />
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
          
          {/* Publication Review Dialog */}
          <PublicationReviewForm
            publication={reviewPublication}
            isOpen={!!reviewPublication}
            onClose={() => setReviewPublication(null)}
            onReviewSubmitted={() => {
              // refresh claims and expert distributions after an expert submits/updates a review
              fetchData();
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Claims;