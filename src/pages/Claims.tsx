import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ChevronUp, ExternalLink, Users, Heart, Eye, BookOpen, DollarSign, Plus, Filter, FileText, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourcesSection } from '@/components/resources/ResourcesSection';
import { getClassificationReasons } from '@/types/review';
import { getEvidenceClassificationColor } from '@/lib/classification-colors';
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
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  created_at: string;
}

interface PublicationScoreRow {
  id: string;
  publication_id: string;
  expert_user_id: string;
  // New JSON-based schema
  review_data: {
    category?: string;
    tags?: {
      testedInHuman?: boolean;
      ethnicityLabels?: string[];
      ageRanges?: string[];
    };
    qualityChecks?: {
      studyDesign?: 'PASS' | 'NO' | 'NA' | null;
      representation?: 'PASS' | 'NO' | 'NA' | null;
      controlGroup?: 'PASS' | 'NO' | 'NA' | null;
      biasAddressed?: 'PASS' | 'NO' | 'NA' | null;
      statistics?: 'PASS' | 'NO' | 'NA' | null;
    };
    womenNotIncluded?: boolean;
  } | null;
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
    stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
    // raw individual score rows so we can detect if current expert already reviewed
    rawScores?: PublicationScoreRow[];
  }[];
  comments?: ClaimCommentRow[];
  status: 'pending' | 'under_review' | 'approved';
}



// We'll load claims from Supabase. The UI expects a specific shape so we map DB rows into that shape.

const CLAIMS_PER_PAGE = 20;

const Claims = () => {
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [hasMoreClaims, setHasMoreClaims] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [filterByCategory, setFilterByCategory] = useState<Database['public']['Enums']['claim_category'] | 'all'>('all');
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // component-scoped Supabase client
  const sb = supabase;

  // Check if user is expert or researcher
  const [isExpert, setIsExpert] = useState(false);
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpert(false);
        return;
      }
      
      try {
        // Check if user has expert or researcher role in user_roles table
        const { data } = await sb.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'expert' 
        });
        
        const { data: researcherData } = await sb.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'researcher' 
        });
        
        setIsExpert((data || false) || (researcherData || false));
      } catch (error) {
        console.error('Error checking expert/researcher status:', error);
        setIsExpert(false);
      }
    };
    
    checkExpertStatus();
  }, [user, sb]);



  const fetchClaimsData = useCallback(async (page: number = 0) => {
    try {
      // Build the claims query with pagination, filtering, and sorting
      let claimsQuery = sb
        .from('claims')
        .select('*', { count: 'exact' })
        .range(page * CLAIMS_PER_PAGE, (page + 1) * CLAIMS_PER_PAGE - 1);

      // Apply category filter
      if (filterByCategory !== 'all') {
        claimsQuery = claimsQuery.eq('category', filterByCategory);
      }

      // Apply sorting
      if (sortBy === 'votes') {
        claimsQuery = claimsQuery.order('vote_count', { ascending: false });
      } else {
        claimsQuery = claimsQuery.order('created_at', { ascending: false });
      }

      // Batch the first set of queries in parallel for better performance
      const [
        { data: claimsData, error: claimsError, count },
        { data: userVotesData, error: votesError }
      ] = await Promise.all([
        claimsQuery,
        user ? sb.from('claim_votes').select('claim_id').eq('user_id', user.id) : Promise.resolve({ data: null, error: null })
      ]);

      if (claimsError) throw claimsError;

      // Update pagination state
      setTotalClaims(count || 0);
      const totalPages = Math.ceil((count || 0) / CLAIMS_PER_PAGE);
      setHasMoreClaims(page < totalPages - 1);

      // Batch the claim-dependent queries in parallel
      const claimIds = claimsData?.map(c => c.id) || [];
      const [
        { data: publicationsData, error: publicationsError },
        { data: reactionsData, error: reactionsError },
        { data: commentsData, error: commentsError }
      ] = await Promise.all([
        sb.from('publications').select('*').in('claim_id', claimIds),
        sb.from('claim_reactions').select('*').in('claim_id', claimIds),
        sb.from('claim_comments').select('*').in('claim_id', claimIds).order('created_at', { ascending: true })
      ]);

      if (publicationsError) throw publicationsError;
      if (reactionsError) throw reactionsError;
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
            stance: p.stance,
            rawScores: []
          };
        });

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

      // Set user votes from the batched query above
      if (!votesError && userVotesData) {
        setUserVotes(new Set(userVotesData.map(v => v.claim_id)));
      } else {
        setUserVotes(new Set());
      }

      // Batch the final queries for publication scores and expert profiles
      try {
        const pubIds = mappedClaims.flatMap(c => c.publications.map(p => p.id));
        if (pubIds.length > 0) {
          // Fetch scores first to determine which experts we need
          const { data: scoreRows, error: scoreErr } = await sb
            .from('publication_scores')
            .select('*')
            .in('publication_id', pubIds as string[]);

          if (!scoreErr && scoreRows) {
            const scoreRowsTyped = scoreRows as PublicationScoreRow[];
            const scoreMap: Record<string, PublicationScoreRow[]> = {};
            const expertIdsSet = new Set<string>();
            
            // Build score map and collect expert IDs in one pass
            scoreRowsTyped.forEach((r) => {
              if (!scoreMap[r.publication_id]) scoreMap[r.publication_id] = [];
              scoreMap[r.publication_id].push(r);
              if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
            });

            // Fetch expert profiles in parallel with updating claims
            const expertIds = Array.from(expertIdsSet);
            const expertProfilesPromise = expertIds.length > 0 
              ? sb.from('expert_stats').select('user_id, display_name, avatar_url').in('user_id', expertIds as string[])
              : Promise.resolve({ data: null, error: null });

            const [{ data: statsRows, error: statsErr }] = await Promise.all([
              expertProfilesPromise
            ]);

            // Update claims with scores
            const updatedClaims = mappedClaims.map((cl) => ({
              ...cl,
              publications: cl.publications.map((pub) => {
                const rows = scoreMap[pub.id] || pub.rawScores || [];
                return {
                  ...pub,
                  rawScores: rows
                };
              })
            }));

            setClaims(updatedClaims);

            // Set expert profiles
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
      } catch (e) {
        console.error('Failed to load publication_scores', e);
      }
    } catch (err) {
      console.error('Error loading claims:', err);
    }
  }, [sb, user, filterByCategory, sortBy]);

  // Move fetchData outside useEffect so it can be called from form submission
  const fetchData = useCallback(async (page: number = 0) => {
    setLoading(true);
    try {
      // Fetch claims data for the specified page
      await fetchClaimsData(page);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchClaimsData]);

  // Load data when filters, sorting, or page changes
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [filterByCategory, sortBy, currentPage]);

  const handleVote = async (id: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    const hasVoted = userVotes.has(id);

    // Optimistic UI update
    if (hasVoted) {
      // Remove vote
      setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
      setUserVotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      // Add vote
      setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: claim.votes + 1 } : claim));
      setUserVotes(prev => new Set(prev).add(id));
    }

    try {
      if (hasVoted) {
        // Remove vote from database
        const { error: delError } = await sb.from('claim_votes').delete().eq('claim_id', id).eq('user_id', user.id);
        if (delError) throw delError;
      } else {
        // Add vote to database
        const { error: insertError } = await sb.from('claim_votes').insert({ claim_id: id, user_id: user.id });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Vote failed:', err);
      // Revert optimistic update on error
      if (hasVoted) {
        // Restore vote
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: claim.votes + 1 } : claim));
        setUserVotes(prev => new Set(prev).add(id));
      } else {
        // Remove vote
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
        setUserVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
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
      fitness: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      mental_health: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pregnancy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      menopause: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      general_health: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      perimenopause: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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

  const getStanceIcon = (stance: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null | undefined) => {
    switch (stance) {
      case 'supporting':
        return <div title="Supporting evidence"><CheckCircle className="w-4 h-4 text-green-600" /></div>;
      case 'contradicting':
        return <div title="Contradicting evidence"><XCircle className="w-4 h-4 text-red-600" /></div>;
      case 'neutral':
        return <div className="w-4 h-4 rounded-full bg-gray-400" title="Neutral evidence" />;
      case 'mixed':
        return <div className="w-4 h-4 rounded-full bg-orange-400" title="Mixed evidence" />;
      default:
        return null;
    }
  };

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
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
        score?: 'PASS' | 'NO' | 'NA' | null;
      }>;
      comments: Array<{
        content: string;
        created_at: string;
      }>;
      classification?: string | null;
      tags?: {
        testedInHuman?: boolean;
        ethnicityLabels?: string[];
        ageRanges?: string[];
      } | null;
      womenNotIncluded?: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviewData?: any;
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
          {reviewCards.map((reviewCard) => {
            // Extract tags from the reviewCard (if present)
            // The tags are not currently passed in the reviewCard, so we need to get them from classification or add them to the reviewCard in the parent if possible.
            // For now, try to get them from the expert.classification if it is an object (future-proofing), else skip.
            // But the correct way is to pass tags in the reviewCard.expert, so let's check if they exist.
            const tags = reviewCard.expert.tags || null;
            return (
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
                        <Badge className={`text-xs ${getEvidenceClassificationColor(String(reviewCard.expert.classification))}`}>
                          {String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}
                        </Badge>
                        {/* Show reasons for negative classifications */}
                        {reviewCard.expert.reviewData && 
                         (reviewCard.expert.classification === 'Invalid' || 
                          reviewCard.expert.classification === 'Unreliable' || 
                          reviewCard.expert.classification === 'Fallacy') && (
                          <div className="mt-2">
                            {(() => {
                              const reasons = getClassificationReasons(reviewCard.expert.reviewData);
                              if (reasons.length > 0) {
                                return (
                                  <div className="text-xs text-muted-foreground">
                                    <div className="font-medium mb-1">Reason{reasons.length > 1 ? 's' : ''}:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                      {reasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Show tags if present */}
                    {tags && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(tags.ethnicityLabels) && tags.ethnicityLabels.length > 0 && (
                          <span className="text-xs flex items-center gap-1">
                            <span className="font-medium">Ethnicities:</span>
                            {tags.ethnicityLabels.map((eth: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{eth}</Badge>
                            ))}
                          </span>
                        )}
                        {Array.isArray(tags.ageRanges) && tags.ageRanges.length > 0 && (
                          <span className="text-xs flex items-center gap-1">
                            <span className="font-medium">Ages:</span>
                            {tags.ageRanges.map((age: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{age}</Badge>
                            ))}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Show Women Not Included label if flagged */}
                    {reviewCard.expert.womenNotIncluded && (
                      <div className="mt-2">
                        <Badge className="text-xs bg-red-100 text-red-800">
                          ♀ Women Not Included
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
                    <div className="flex flex-row flex-wrap gap-3 items-center">
                      {reviewCard.expert.scores.map((scoreItem, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          {(() => {
                            // Explanations and human labels for each score category
                            const explanations: Record<string, string> = {
                              studyDesign: 'Was the study designed to answer this claim?',
                              representation: 'Do the people in the study represent the kinds of people the claim is about?',
                              controlGroup: 'Was there a proper control group (wildtype, baseline, placebo, standard of care, matched cohort)?',
                              biasAddressed: 'Were confounding variables identified and tracked (e.g., time, age, sex, comorbidities, socioeconomic factors)?',
                              statistics: 'Were statistical tests appropriate for the study design and data type?'
                            };
                            const humanLabels: Record<string, string> = {
                              studyDesign: 'Study Design',
                              representation: 'Representation',
                              controlGroup: 'Control Group',
                              biasAddressed: 'Bias Addressed',
                              statistics: 'Statistics'
                            };
                            const label = humanLabels[scoreItem.category] || scoreItem.category;
                            const explanation = explanations[scoreItem.category] || '';
                            return explanation ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <span className="text-sm text-muted-foreground underline decoration-dotted cursor-help">{label}:</span>
                                </PopoverTrigger>
                                <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                  {explanation}
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="text-sm text-muted-foreground">{label}:</span>
                            );
                          })()}
                          <Badge className={`text-xs px-1 py-1 ${scoreItem.score === 'NO' ? 'bg-yellow-700 text-white hover:bg-yellow-800' : ''}`}>
                            {scoreItem.score ?? 'No score'}
                          </Badge>
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
            );
          })}
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

  // Claims are now filtered and sorted by the database query
  const filteredAndSortedClaims = claims;

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
                          fetchData(currentPage);
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
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Loading claims...
                  </div>
                </div>
              )}
              
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
                        variant={userVotes.has(claim.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(claim.id)}
                        className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                        disabled={!user}
                      >
                        <ChevronUp className="w-4 h-4" />
                        {claim.votes}
                      </Button>

                      {/* Add Paper button: moved from bottom to top right under vote button */}
                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPaperForm(claim.id)}
                          className="flex items-center gap-2 text-xs mt-1"
                        >
                          <FileText className="w-4 h-4" />
                          Add Paper
                        </Button>
                      )}
                    </div>
                  </div>                  
                  {/* Aggregated Category Labels from all expert reviews, separated by stance */}
                  <div className="mt-2 space-y-2">
                    {(() => {
                      // Separate publications by stance and aggregate their reviews
                      const supportingLabelCounts: Record<string, number> = {};
                      const contradictingLabelCounts: Record<string, number> = {};
                      let supportingWomenNotIncluded = 0;
                      let contradictingWomenNotIncluded = 0;

                      claim.publications.forEach(pub => {
                        (pub.rawScores || []).forEach(score => {
                          const label = score.review_data?.category;
                          if (label) {
                            if (pub.stance === 'supporting') {
                              supportingLabelCounts[label] = (supportingLabelCounts[label] || 0) + 1;
                            } else if (pub.stance === 'contradicting') {
                              contradictingLabelCounts[label] = (contradictingLabelCounts[label] || 0) + 1;
                            }
                          }
                          // Check for womenNotIncluded flag
                          if (score.review_data?.womenNotIncluded) {
                            if (pub.stance === 'supporting') {
                              supportingWomenNotIncluded++;
                            } else if (pub.stance === 'contradicting') {
                              contradictingWomenNotIncluded++;
                            }
                          }
                        });
                      });

                      const createLabelsForStance = (labelCounts: Record<string, number>, womenNotIncludedCount: number, stance: 'supporting' | 'contradicting') => {
                        const labels = Object.entries(labelCounts).map(([label, count]) => {
                          const color = getEvidenceClassificationColor(label);
                          
                          // Get aggregated reasons for negative classifications
                          let aggregatedReasons: string[] = [];
                          if (label === 'Invalid' || label === 'Unreliable' || label === 'Fallacy') {
                            const allReasons: string[] = [];
                            claim.publications.forEach(pub => {
                              if (pub.stance === stance) {
                                (pub.rawScores || []).forEach(score => {
                                  if (score.review_data?.category === label) {
                                    const reasons = getClassificationReasons(score.review_data);
                                    allReasons.push(...reasons);
                                  }
                                });
                              }
                            });
                            // Get unique reasons and their counts
                            const reasonCounts: Record<string, number> = {};
                            allReasons.forEach(reason => {
                              reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                            });
                            aggregatedReasons = Object.entries(reasonCounts)
                              .sort(([,a], [,b]) => b - a) // Sort by count descending
                              .map(([reason, reasonCount]) => 
                                reasonCount > 1 ? `${reason} (${reasonCount})` : reason
                              );
                          }
                          
                          const labelElement = (
                            <span
                              key={`${stance}-${label}`}
                              className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ${color}`}
                              style={{ borderWidth: 0 }}
                            >
                              {label} <span className="ml-2">({count})</span>
                            </span>
                          );
                          
                          // If there are reasons, wrap in a popover
                          if (aggregatedReasons.length > 0) {
                            return (
                              <Popover key={`${stance}-${label}`}>
                                <PopoverTrigger asChild>
                                  <div className="cursor-help">
                                    {labelElement}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Reasons for {label} classification:</h4>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                      {aggregatedReasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          }
                          
                          return labelElement;
                        });
                        
                        // Add women not included label if any reviews marked it
                        if (womenNotIncludedCount > 0) {
                          labels.push(
                            <span
                              key={`${stance}-women-included`}
                              className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-red-100 text-red-800"
                            >
                              ♀ Women Not Included <span className="ml-2">({womenNotIncludedCount})</span>
                            </span>
                          );
                        }
                        
                        return labels;
                      };

                      const supportingLabels = createLabelsForStance(supportingLabelCounts, supportingWomenNotIncluded, 'supporting');
                      const contradictingLabels = createLabelsForStance(contradictingLabelCounts, contradictingWomenNotIncluded, 'contradicting');

                      return (
                        <>
                          {supportingLabels.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div title="Supporting evidence">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {supportingLabels}
                              </div>
                            </div>
                          )}
                          {contradictingLabels.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div title="Contradicting evidence">
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {contradictingLabels}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
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
                              <div className="flex items-start gap-2 flex-1">
                                {getStanceIcon(pub.stance)}
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm mb-1">{pub.title}</h5>
                                  <p className="text-xs text-muted-foreground">
                                    {pub.authors} • {pub.journal} ({pub.year})
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isExpert && (() => {
                                  const existingReview = pub.rawScores?.find(rs => rs.expert_user_id === user?.id) || null;
                                  const reviewButtonText = existingReview ? 'Update' : 'Review';
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
                                    
                                  </a>
                                </Button>
                              </div>
                            </div>

                            {/* Reviewer details moved to the Expert Reviews Reel below to avoid duplication. */}
                            {/* <div className="text-xs text-muted-foreground">Reviewer scores and comments are available in the "Expert Reviews Reel" below.</div> */}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Bottom section with See Full Review button and reactions */}
                <CardContent className="pt-2">
                  {user && (
                    <div className="border-t border-border pt-3 flex flex-wrap items-center justify-between gap-3">
                      {/* SEE FULL REVIEW first and highlighted */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowReelClaim(claim.id)}
                        className="flex items-center gap-2 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        Review Reel
                      </Button>

                      {/* Reaction buttons: moved to bottom right */}
                      <div className="flex items-center gap-2">
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
                  )}
                </CardContent>

                {/* ReelsCarousel for expert reviews - moved to dialog. Do not render inline when card is expanded. */}
                {/* The full review reel is available via the 'See Full Review' button which opens the dialog. */}
              </Card>
            ))}
            
            {/* Pagination Controls */}
            {totalClaims > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 p-4 bg-card/30 rounded-lg border">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * CLAIMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * CLAIMS_PER_PAGE, totalClaims)} of {totalClaims} claims
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                    className="min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      'Previous'
                    )}
                  </Button>
                  <div className="px-3 py-1 text-sm bg-background rounded border min-w-[100px] text-center">
                    Page {currentPage + 1} of {Math.ceil(totalClaims / CLAIMS_PER_PAGE)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasMoreClaims || loading}
                    className="min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              </div>
            )}
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
                        fetchData(currentPage);
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
                    const expertScores: Array<{ category: string; score?: 'PASS' | 'NO' | 'NA' | null }> = [
                      { category: 'studyDesign', score: latestRow?.review_data?.qualityChecks?.studyDesign ?? null },
                      { category: 'representation', score: latestRow?.review_data?.qualityChecks?.representation ?? null },
                      { category: 'statistics', score: latestRow?.review_data?.qualityChecks?.statistics ?? null },
                      { category: 'controlGroup', score: latestRow?.review_data?.qualityChecks?.controlGroup ?? null },
                      { category: 'biasAddressed', score: latestRow?.review_data?.qualityChecks?.biasAddressed ?? null }
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
                        classification: latestRow?.review_data?.category ?? null,
                        tags: latestRow?.review_data?.tags ?? null,
                        womenNotIncluded: latestRow?.review_data?.womenNotIncluded ?? false,
                        reviewData: latestRow?.review_data ?? null
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
              fetchData(currentPage);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Claims;