import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ExternalLink, Users, Info, Heart, Eye, BookOpen, DollarSign, Plus, Filter, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import ExpertScoreDistribution from '@/components/ui/expert-score-distribution';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
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
  category: Database['public']['Enums']['evidence_score_category']; // study_size | population | consensus | interpretation
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
  status: 'pending' | 'under_review' | 'approved';
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
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertDistributions, setExpertDistributions] = useState<Record<string, ExpertDistribution[]>>({});
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
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

  const mapScoreIntToLabel = (n: number): 'low' | 'medium' | 'high' => {
    if (n >= 4) return 'high';
    if (n === 3) return 'medium';
    return 'low';
  };

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

    (rows || []).forEach((r) => {
      const cat = r.category; // 'study_size' | 'population' | 'consensus' | 'interpretation'
      const label = mapScoreIntToLabel(r.score);
      if (cat === 'study_size') scoresTemplate.sampleSize = { score: label, explanation: r.notes || '' };
      else if (cat === 'population') scoresTemplate.populationRepresentation = { score: label, explanation: r.notes || '' };
      else if (cat === 'consensus') scoresTemplate.consensus = { score: label, explanation: r.notes || '' };
      else if (cat === 'interpretation') scoresTemplate.evidence = { score: label, explanation: r.notes || '' };
    });
    return scoresTemplate;
  }, []);

  const fetchExpertDistributions = useCallback(async () => {
    try {
      // Fetch score distributions aggregated by claim and category
      const { data: scoreData, error } = await sb.from('publication_scores')
        .select(`
          score,
          category,
          publications!inner(claim_id)
        `);
      
      if (error) throw error;

      // Process the data to create distributions
      const distributionMap: Record<string, Record<string, { low: number; medium: number; high: number; }>> = {};
      
      type ScoreItem = { score: number; category: string; publications: { claim_id: string } };
      scoreData?.forEach((item: ScoreItem) => {
        const claimId = item.publications.claim_id;
        const category = item.category;
        const score = item.score;
        
        if (!distributionMap[claimId]) {
          distributionMap[claimId] = {};
        }
        
        if (!distributionMap[claimId][category]) {
          distributionMap[claimId][category] = { low: 0, medium: 0, high: 0 };
        }
        
        // Map score to category (same logic as existing mapScoreIntToLabel)
        const scoreLevel = score >= 4 ? 'high' : score === 3 ? 'medium' : 'low';
        distributionMap[claimId][category][scoreLevel]++;
      });

      // Convert to the format expected by the component
      const distributions: Record<string, ExpertDistribution[]> = {};
      
      Object.entries(distributionMap).forEach(([claimId, categories]) => {
        distributions[claimId] = Object.entries(categories).map(([category, dist]) => {
          const totalExperts = dist.low + dist.medium + dist.high;
          
          const categoryLabels: Record<string, string> = {
            'study_size': 'Sample Size',
            'population': 'Population',
            'consensus': 'Consensus', 
            'interpretation': 'Evidence Quality'
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
  }, [sb]);

  const fetchClaimsData = useCallback(async () => {
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
            id: p.id, // Add publication ID
            title: p.title,
            authors: p.authors || '',
            journal: p.journal || '',
            year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear()),
            url: p.url || p.doi || '',
            scores,
            // include raw score rows so UI can detect whether current user already reviewed
            rawScores: scoresRows
          };
        });

        // map DB category directly to UI category (show DB value)
        const uiCategory = c.category;

        const statusMap: Record<string, ClaimUI['status']> = {
          pending: 'pending',
          proposed: 'under_review',
          needs_more_evidence: 'under_review',
          verified: 'approved',
          disputed: 'under_review'
        };

        return {
          id: c.id!,
          claim: c.title || c.description || '',
          category: uiCategory!,
          votes: c.vote_count || 0,
          publications: pubs,
          status: statusMap[c.status] || 'pending'
        };
      });

      setClaims(mappedClaims);
      setReactions(reactionsByClaim);

      // If the view did not include publication_scores nested, fetch them as a fallback and attach to publications
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

            // fetch any missing expert profiles discovered in the fallback rows
            const expertIdsSet = new Set<string>();
            scoreRowsTyped.forEach((r) => {
              if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
            });

            const expertIds = Array.from(expertIdsSet);
            if (expertIds.length > 0) {
              const { data: profilesRows2, error: profilesErr2 } = await sb
                .from('profiles')
                .select('user_id, display_name, avatar_url, profile_avatar_url, full_name, id, user')
                .in('user_id', expertIds as string[]);

              if (!profilesErr2 && profilesRows2) {
                const normalizeProfileRows = (rows: unknown[]) => {
                  const map: Record<string, { display_name?: string | null; avatar_url?: string | null }> = {};
                  rows.forEach((r) => {
                    if (!r || typeof r !== 'object') return;
                    const rec = r as Record<string, unknown>;
                    let key: string | null = null;
                    if (typeof rec.user_id === 'string') key = rec.user_id;
                    else if (typeof rec.id === 'string') key = rec.id;
                    else if (rec.user && typeof rec.user === 'object' && typeof (rec.user as Record<string, unknown>).id === 'string') {
                      key = (rec.user as Record<string, unknown>).id as string;
                    }
                    if (!key) return;
                    const display = typeof rec.display_name === 'string' ? rec.display_name : typeof rec.full_name === 'string' ? rec.full_name : null;
                    // Use the `avatar_url` column from profiles specifically
                    const avatar = typeof rec.avatar_url === 'string' ? rec.avatar_url : null;
                    map[key] = { display_name: display, avatar_url: avatar };
                  });
                  return map;
                };

                const profilesMap2 = normalizeProfileRows(profilesRows2 as unknown[]);
                setExpertProfiles(prev => ({ ...prev, ...profilesMap2 }));
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load publication_scores fallback', e);
      }

      // Collect expert user ids from publication_scores and load display names/avatars
      try {
        const expertIdsSet = new Set<string>();
        joined.forEach((c) => {
          (c.publications || []).forEach((p: PublicationRow & { publication_scores?: PublicationScoreRow[] }) => {
            (p.publication_scores || []).forEach((s: PublicationScoreRow) => {
              if (s.expert_user_id) expertIdsSet.add(s.expert_user_id);
            });
          });
        });

        const expertIds = Array.from(expertIdsSet);
        if (expertIds.length > 0) {
          const { data: profilesRows, error: profilesErr } = await sb
            .from('profiles')
            .select('user_id, display_name, avatar_url, profile_avatar_url, full_name, id, user')
            .in('user_id', expertIds as string[]);

          if (!profilesErr && profilesRows) {
            const normalizeProfileRows = (rows: unknown[]) => {
              const map: Record<string, { display_name?: string | null; avatar_url?: string | null }> = {};
              rows.forEach((r) => {
                if (!r || typeof r !== 'object') return;
                const rec = r as Record<string, unknown>;
                let key: string | null = null;
                if (typeof rec.user_id === 'string') key = rec.user_id;
                else if (typeof rec.id === 'string') key = rec.id;
                else if (rec.user && typeof rec.user === 'object' && typeof (rec.user as Record<string, unknown>).id === 'string') {
                  key = (rec.user as Record<string, unknown>).id as string;
                }
                if (!key) return;
                const display = typeof rec.display_name === 'string' ? rec.display_name : typeof rec.full_name === 'string' ? rec.full_name : null;
                // Use the `avatar_url` column from profiles specifically
                const avatar = typeof rec.avatar_url === 'string' ? rec.avatar_url : null;
                map[key] = { display_name: display, avatar_url: avatar };
              });
              return map;
            };

            const profilesMap = normalizeProfileRows(profilesRows as unknown[]);
            setExpertProfiles(prev => ({ ...prev, ...profilesMap }));
          }
        }
      } catch (e) {
        console.error('Failed to load expert profiles', e);
      }
    } catch (err) {
      console.error('Error loading claims:', err);
    }
  }, [sb, mapEvidenceRowToScores]);

  // Move fetchData outside useEffect so it can be called from form submission
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch claims data
      await Promise.all([
        fetchClaimsData(),
        fetchExpertDistributions()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchExpertDistributions, fetchClaimsData]);

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
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: 'low' | 'medium' | 'high', hasScore: boolean = true) => {
    if (!hasScore) {
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
    const colors = {
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
      'consensus': 'Consensus',
      'interpretation': 'Evidence Quality'
    };
    return labels[category] || category;
  };

  // ReelsCarousel: vertically scrollable list of individual review items
  type ReviewItem = {
    id: string;
    expert_user_id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    publicationTitle: string;
    publicationJournal?: string;
    year?: number;
    category: string;
    score: 'low' | 'medium' | 'high';
    notes?: string | null;
  };

  const ReelsCarousel: React.FC<{ items: ReviewItem[] }> = ({ items }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    if (!items || items.length === 0) return null;

    return (
      <div className="relative">
        <button
          aria-label="Scroll up"
          onClick={() => containerRef.current?.scrollBy({ top: -320, behavior: 'smooth' })}
          className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 bg-background/80 border border-border rounded-full p-1 hover:shadow"
        >
          ▲
        </button>

        <div
          ref={containerRef}
          className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] p-2"
          role="list"
          aria-label="Expert review reels (vertical)"
        >
          {items.map((it) => (
            <div key={it.id} role="listitem" className="w-full snap-start bg-background/60 border border-border rounded p-3">
              <div className="flex items-center gap-3 mb-2">
                {it.avatar_url ? (
                  <img src={it.avatar_url} alt={it.display_name || 'Expert'} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-sm flex items-center justify-center">
                    {(it.display_name || 'E').split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium">{it.display_name || 'Expert'}</div>
                  <div className="text-xs text-muted-foreground">{it.publicationJournal} • {it.year}</div>
                </div>
              </div>

              <div className="text-sm font-semibold mb-2">{it.publicationTitle}</div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{getCategoryLabel(it.category)}</span>
                <Badge className={`text-xs px-2 py-0 ${getScoreColor(it.score)}`}>{it.score}</Badge>
              </div>

              {it.notes && (
                <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">"{it.notes}"</div>
              )}
            </div>
          ))}
        </div>

        <button
          aria-label="Scroll down"
          onClick={() => containerRef.current?.scrollBy({ top: 320, behavior: 'smooth' })}
          className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-10 bg-background/80 border border-border rounded-full p-1 hover:shadow"
        >
          ▼
        </button>
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>All Claims must be linked to scientific publications</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" disabled={!user}>
                      <Plus className="w-4 h-4" />
                      {user ? 'Submit New Claim' : 'Sign in to Submit Claim'}
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
          </div>

          {/* Claims List */}
          <div className="max-w-4xl mx-auto space-y-6">
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
                          const Icon = reaction.icon;
                          return (
                            <Button
                              key={reaction.type}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs flex items-center gap-1"
                              onClick={() => handleReaction(claim.id, reaction.type)}
                              title={reaction.label}
                            >
                              <Icon className={`w-4 h-4 ${reaction.color}`} />
                              <span className="text-xs">{count > 0 ? count : ''}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expert Score Distributions */}
                  {expertDistributions[claim.id] && (
                    <ExpertScoreDistribution distributions={expertDistributions[claim.id]} />
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showReelClaim);
                  if (!claim) return <div className="text-center text-sm text-muted-foreground">No reviews available.</div>;
                  const items = claim.publications.flatMap(pub => (
                    (pub.rawScores || []).map(score => ({
                      id: score.id,
                      expert_user_id: score.expert_user_id,
                      display_name: expertProfiles[score.expert_user_id]?.display_name,
                      avatar_url: expertProfiles[score.expert_user_id]?.avatar_url,
                      publicationTitle: pub.title,
                      publicationJournal: pub.journal,
                      year: pub.year,
                      category: score.category,
                      score: mapScoreIntToLabel(score.score),
                      notes: score.notes
                    }))
                  ));

                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{claim.claim} — Full Expert Reviews</h3>
                      {items.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No reviews yet for this claim.</div>
                      ) : (
                        <ReelsCarousel items={items} />
                      )}
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
        </div>
      </main>
    </div>
  );
};

export default Claims;