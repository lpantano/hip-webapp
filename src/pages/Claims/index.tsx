import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ChevronUp, ChevronDown, ExternalLink, Eye,  Plus, Filter, FileText, Lock, LogIn, Link, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { getCategoryBackgroundColor } from '@/lib/classification-categories';
import { CLASSIFICATION_CATEGORIES, getCategoryDescription } from '@/lib/classification-categories';
import { getStudyTagDescription, STUDY_TAG, getStudyTagColor } from '@/lib/classification-categories';
import { aggregateLabelsForClaim } from '@/lib/label-aggregation';
import ClaimLabelsStack from '@/pages/Claims/components/ClaimLabelsStack';
import { getCategoryColor } from '@/lib/getCategoryColor';
import ClaimPublicationsExpanded from './components/ClaimPublicationsExpanded';
import CategoriesLegend from './components/Legend';
import ExpertReviewsReel, { type ExpertReviewCard } from './components/ExpertReviewsReel';
import { SourceFormDialog } from './components/SourceFormDialog';
import type { Database } from '@/integrations/supabase/types';
import type { ClaimUI, ClaimRow, ClaimCommentRow, PublicationRow, ClaimLinkRow, PublicationScoreRow } from './types';
import { CLAIM_CATEGORIES_WITH_ALL } from '@/constants/categories';
import { humanize, getStatusColor, getStanceIcon, groupBy } from './utils/helpers';
import { useOptimisticVote } from './hooks/useOptimisticVote';
import { useReviewCards } from './hooks/useReviewCards';
import { CLAIMS_PER_PAGE, SPECIAL_CLAIM_ID, CLAIM_STATUS } from './constants';

const Claims = () => {
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [hasMoreClaims, setHasMoreClaims] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [filterByCategory, setFilterByCategory] = useState<Database['public']['Enums']['claim_category'] | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [showSourceForm, setShowSourceForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user } = useAuth();

  // Use custom hook for optimistic vote updates
  const {
    userVotes,
    optimisticallyAddVote,
    optimisticallyRemoveVote,
    revertVote,
    setUserVotes
  } = useOptimisticVote(setClaims);

  // Confirmation dialog state for toggling claim status
  const [confirmToggleClaimId, setConfirmToggleClaimId] = useState<string | null>(null);
  const [confirmToggleRawStatus, setConfirmToggleRawStatus] = useState<string | null>(null);

  // component-scoped Supabase client
  const sb = supabase;

  // Check if user is expert or researcher
  const [isExpert, setIsExpert] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
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



  // Use the groupBy helper for cleaner data grouping
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
        { data: commentsData, error: commentsError },
        { data: linksData, error: linksError }
      ] = await Promise.all([
        sb.from('publications').select('*').in('claim_id', claimIds),
        sb.from('claim_comments').select('*').in('claim_id', claimIds).order('created_at', { ascending: true }),
        sb.from('claim_links').select('*').in('claim_id', claimIds)
      ]);

      if (publicationsError) throw publicationsError;
      if (commentsError) throw commentsError;

      // Use groupBy helper for cleaner data organization
      const publicationsByClaim = groupBy(publicationsData || [], (pub: PublicationRow) => pub.claim_id);
      const commentsByClaim = groupBy(commentsData || [], (comment: ClaimCommentRow) => comment.claim_id);
      const linksByClaim = groupBy((linksData || []) as ClaimLinkRow[], (link) => link.claim_id);



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
            source: p.source || null,
            stance: p.stance,
            rawScores: []
          };
        });


        return {
          id: c.id,
          claim: c.title || c.description || '',
          user_id: c.user_id,
          category: c.category,
          votes: c.vote_count || 0,
          publications: pubs,
          links: (linksByClaim[c.id] || []).map(l => ({ id: l.id, title: l.title, url: l.url, description: l.description, link_type: l.link_type, expert_user_id: l.expert_user_id })),
          comments: commentsByClaim[c.id] || [],
          // preserve DB enum/status values directly as requested
          rawStatus: c.status,
          status: c.status as ClaimUI['status']
        };
      });

      setClaims(mappedClaims);

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
  }, [sb, user, filterByCategory, sortBy, setUserVotes]);

  // Move fetchData outside useEffect so it can be called from form submission
  const fetchData = useCallback(async (page: number = 0) => {
    setLoading(true);
    try {
      // Fetch claims data for the specified page
      await fetchClaimsData(page);
      // Don't set currentPage here - it's already set by the caller or useEffect
      // Setting it here causes infinite loops when fetchData is in useEffect dependencies
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
    setCurrentPage(0);
  }, [filterByCategory, sortBy]);

  const handleVote = async (id: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    const hasVoted = userVotes.has(id);

    // Optimistic UI update using custom hook
    if (hasVoted) {
      optimisticallyRemoveVote(id);
    } else {
      optimisticallyAddVote(id);
    }

    try {
      if (hasVoted) {
        const { error: delError } = await sb.from('claim_votes').delete().eq('claim_id', id).eq('user_id', user.id);
        if (delError) throw delError;
      } else {
        const { error: insertError } = await sb.from('claim_votes').insert({ claim_id: id, user_id: user.id });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Vote failed:', err);
      // Revert optimistic update on error
      revertVote(id, !hasVoted);
    }
  };

  const toggleClaimStatus = async (claimId: string, rawStatus?: string) => {
    if (!user) return;
    // Only allow toggle between 'proposed' and 'under review'
    if (rawStatus !== CLAIM_STATUS.PROPOSED && rawStatus !== CLAIM_STATUS.UNDER_REVIEW) return;

    const newStatus = rawStatus === CLAIM_STATUS.PROPOSED ? CLAIM_STATUS.UNDER_REVIEW : CLAIM_STATUS.PROPOSED;
    try {
      setUpdatingStatus(claimId);
      const { error } = await sb.from('claims').update({ status: newStatus }).eq('id', claimId);
      if (error) throw error;
      // Refresh data
      await fetchData(currentPage);
      toast.success('Status updated', { description: `Claim status set to ${newStatus}.` });
    } catch (e: unknown) {
      console.error('Failed to update claim status', e);
      const msg = e instanceof Error ? e.message : 'Failed to update status';
      toast.error('Update failed', { description: msg });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Confirm + toggle flow: user clicks badge -> open dialog -> confirmAndToggle calls toggleClaimStatus
  const confirmAndToggle = async () => {
    if (!confirmToggleClaimId || !confirmToggleRawStatus) {
      setConfirmToggleClaimId(null);
      setConfirmToggleRawStatus(null);
      return;
    }
    try {
      await toggleClaimStatus(confirmToggleClaimId, confirmToggleRawStatus);
    } finally {
      setConfirmToggleClaimId(null);
      setConfirmToggleRawStatus(null);
    }
  };

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  const categoryOptions = CLAIM_CATEGORIES_WITH_ALL;


  // Claims are now filtered and sorted by the database query
  // Only show special claim if running on localhost
  let filteredAndSortedClaims = claims;
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
    // On production, filter out the special claim
    filteredAndSortedClaims = claims.filter(c => c.id !== SPECIAL_CLAIM_ID);
  }

  // Use custom hook for review cards generation
  const currentReelClaim = filteredAndSortedClaims.find(c => c.id === showReelClaim);
  const reviewCards = useReviewCards(currentReelClaim, expertProfiles);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 text-center px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 pb-2 leading-[1.15] overflow-visible bg-hero-gradient bg-clip-text text-transparent">
              Health Claims
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Community-driven claims about products and services for women's health conditions.
              Upvote Claims to prioritize them for expert review. <a href="/workflow" className="inline-flex items-center gap-2 text-md sm:text-lg text-primary hover:underline">
                Learn how we review information and science
                <ExternalLink className="w-4 h-4" />
              </a>
            </p>

            {/*Legend (collapsible) */}
            <div className="mb-4 flex flex-col items-center gap-4">


              <div className="w-full max-w-3xl text-center">
                <button
                  type="button"
                  onClick={() => setLegendOpen(!legendOpen)}
                  aria-expanded={legendOpen}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary focus:outline-none"
                >
                  <span className="font-medium">{legendOpen ? 'Hide legend' : 'Show legend'}</span>
                  {legendOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {legendOpen && (
                  <div className="mt-3">
                    <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3">
                      Legend: Click labels to learn more
                    </div>

                    {/* Categories Legend (moved to component) */}
                    <div className="mb-3">
                      <CategoriesLegend />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="claims" className="max-w-4xl mx-auto">
            {/* <TabsList className="grid w-full grid-cols-2 mb-8"> */}
              {/* <TabsTrigger value="claims">Claims</TabsTrigger> */}
              {/* <TabsTrigger value="trusted-resources">Trusted Resources</TabsTrigger> */}
            {/* </TabsList> */}

            {/* Claims Tab */}
            <TabsContent value="claims" className="space-y-6">
              {/* Claims Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>All Claims must be linked to scientific publications</span>
                </div> */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 whitespace-nowrap" disabled={!user}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{user ? 'New Claim' : 'Sign in to Submit Claim'}</span>
                        <span className="sm:hidden">{user ? 'New' : 'Sign In'}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogTitle>Submit a new claim</DialogTitle>
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
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
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
                    className="whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Sort by Votes</span>
                    <span className="sm:hidden">Votes</span>
                  </Button>
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                    className="whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Most Recent</span>
                    <span className="sm:hidden">Recent</span>
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

              {!user && !loading && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="bg-card/60 backdrop-blur-sm rounded-lg p-8 border border-border shadow-lg">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                      <p className="text-muted-foreground mb-6">
                        Please sign in to view community-reviewed health claims and expert insights.
                      </p>
                      <div className="space-y-3">
                        <Button asChild className="w-full">
                          <a href="/auth" className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Sign In
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Join our community of health enthusiasts and experts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user && filteredAndSortedClaims.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No claims found for the selected category.</p>
                </div>
              )}
              {user && filteredAndSortedClaims.map((claim) => (
              <Card key={claim.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  {/* First row: Category/Status badges and vote button */}
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getCategoryColor(claim.category)} pointer-events-none transition-none`}>
                        {humanize(claim.category)}
                      </Badge>
                      {(
                        // Allow experts/researchers to request a status toggle between proposed <-> under review
                        isExpert && (claim.rawStatus === 'proposed' || claim.rawStatus === 'under review')
                      ) ? (
                        <button
                          onClick={() => {
                            // open confirmation dialog instead of toggling immediately
                            setConfirmToggleClaimId(claim.id);
                            setConfirmToggleRawStatus(claim.rawStatus || null);
                          }}
                          className="inline-flex items-center"
                          aria-label={`Toggle status for claim ${claim.id}`}
                          disabled={updatingStatus === claim.id}
                        >
                          <Badge className={getStatusColor(claim.status)} >
                            {updatingStatus === claim.id ? 'Updating...' : claim.status.replace('_', ' ')}
                          </Badge>
                        </button>
                      ) : (
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant={userVotes.has(claim.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(claim.id)}
                      className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground flex-shrink-0 text-xs px-2 py-1 h-7"
                      disabled={!user}
                    >
                      <ChevronUp className="w-3 h-3" />
                      {claim.votes}
                    </Button>
                  </div>

                  {/* Second row: Claim title */}
                  <div className="cursor-pointer" onClick={() => toggleClaimExpansion(claim.id)}>
                    <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                      {claim.claim}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {expandedClaim === claim.id ? '▼' : '▶'}
                      </span>
                    </CardTitle>
                  </div>
                  {/* Aggregated Category Labels from all expert reviews, separated by stance */}
                  <div className="flex-col mt-2">
                    {(() => {
                      // Use the aggregation helper to compute counts and reasons
                      const agg = aggregateLabelsForClaim(claim);
                      const {
                        classificationOrder,
                        supportingLabelCounts,
                        contradictingLabelCounts,
                        supportingWomenNotIncluded,
                        contradictingWomenNotIncluded,
                        supportingObservationalCount,
                        contradictingObservationalCount,
                        supportingClinicalTrialCount,
                        contradictingClinicalTrialCount,
                        aggregatedReasons
                      } = agg;

                      // Build two columns: left for contradicting, right for supporting

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div title="Supporting evidence">{getStanceIcon('supporting')}</div>
                              <span className="font-semibold text-xs">Reported to Support</span>
                            </div>
                            <div>
                              <ClaimLabelsStack
                                classificationOrder={classificationOrder}
                                labelCounts={supportingLabelCounts}
                                womenNotIncludedCount={supportingWomenNotIncluded}
                                observationalCount={supportingObservationalCount}
                                clinicalTrialCount={supportingClinicalTrialCount}
                                stance="supporting"
                                aggregatedReasonsForStance={aggregatedReasons.supporting}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div title="Contradicting evidence">{getStanceIcon('contradicting')}</div>
                              <span className="font-semibold text-xs">Reported to Disproof</span>
                            </div>
                            {/* Use a normal div, not flex-col, so children do not stretch */}
                            <div>
                              <ClaimLabelsStack
                                classificationOrder={classificationOrder}
                                labelCounts={contradictingLabelCounts}
                                womenNotIncludedCount={contradictingWomenNotIncluded}
                                observationalCount={contradictingObservationalCount}
                                clinicalTrialCount={contradictingClinicalTrialCount}
                                stance="contradicting"
                                aggregatedReasonsForStance={aggregatedReasons.contradicting}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </CardHeader>
                {/* Expanded view with individual reviews (moved to component) */}
                {expandedClaim === claim.id && (
                  <ClaimPublicationsExpanded
                    publications={claim.publications}
                    links={claim.links}
                    isExpert={isExpert}
                    user={user}
                    setReviewPublication={setReviewPublication}
                    getStanceIcon={getStanceIcon}
                  />
                )}

                {/* Bottom section with Review Reel and Add Paper buttons */}
                <CardContent className="pt-2">
                  {user && (
                    <div className="border-t border-border pt-3">
                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowReelClaim(claim.id)}
                          className="flex items-center gap-2 shadow-md whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Full Review</span>
                          <span className="sm:hidden">Reviews</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPaperForm(claim.id)}
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Add Paper</span>
                          <span className="sm:hidden">Paper</span>
                        </Button>
                              {(
                                // Allow adding sources when: user is expert/researcher (isExpert) OR user is the claim owner
                                // AND the underlying DB status is exactly 'proposed'. We expose rawStatus on the mapped claim.
                                user && (isExpert || (user.id === claim.user_id && claim.rawStatus === 'proposed'))
                              ) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowSourceForm(claim.id)}
                                  className="flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Link className="w-4 h-4" />
                                  <span className="hidden sm:inline">Add Source</span>
                                  <span className="sm:hidden">Source</span>
                                </Button>
                              )}
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* ReelsCarousel for expert reviews - moved to dialog. Do not render inline when card is expanded. */}
                {/* The full review reel is available via the 'See Full Review' button which opens the dialog. */}
              </Card>
            ))}

            {/* Pagination Controls */}
            {user && totalClaims > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 p-4 bg-card/30 rounded-lg border">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {currentPage * CLAIMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * CLAIMS_PER_PAGE, totalClaims)} of {totalClaims} claims
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                    className="min-w-[70px] sm:min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <span className="text-xs sm:text-sm">Previous</span>
                    )}
                  </Button>
                  <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-background rounded border min-w-[80px] sm:min-w-[100px] text-center">
                    Page {currentPage + 1} of {Math.ceil(totalClaims / CLAIMS_PER_PAGE)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasMoreClaims || loading}
                    className="min-w-[70px] sm:min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <span className="text-xs sm:text-sm">Next</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
            </TabsContent>

            {/* <TabsContent value="trusted-resources" className="space-y-6">
              <ResourcesSection />
            </TabsContent> */}
          </Tabs>

          {/* Paper Submission Dialog */}
          {user && showPaperForm && (
            <Dialog open={!!showPaperForm} onOpenChange={() => setShowPaperForm(null)}>
              <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showPaperForm);
                  return claim ? (
                    <div>
                      <DialogTitle>Add paper</DialogTitle>
                      <PaperSubmissionForm
                        claimId={claim.id}
                        claimTitle={claim.claim}
                        onSuccess={() => {
                          setShowPaperForm(null);
                          fetchData(currentPage);
                        }}
                        onCancel={() => setShowPaperForm(null)}
                      />
                    </div>
                  ) : null;
                })()}
              </DialogContent>
            </Dialog>
          )}

          {/* Source Submission Dialog */}
          {user && showSourceForm && (
            <SourceFormDialog
              isOpen={!!showSourceForm}
              onClose={() => setShowSourceForm(null)}
              claimId={showSourceForm}
              userId={user.id}
              onSuccess={() => fetchData(currentPage)}
            />
          )}

          {/* Confirmation Dialog for toggling claim status */}
          {user && (
            <Dialog open={!!confirmToggleClaimId} onOpenChange={(open) => { if (!open) { setConfirmToggleClaimId(null); setConfirmToggleRawStatus(null); } }}>
              <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogTitle>Confirm status change</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {`Are you sure you want to change the status from "${confirmToggleRawStatus ? confirmToggleRawStatus.replace('_', ' ') : ''}" to "${confirmToggleRawStatus === 'proposed' ? 'under review' : 'proposed'}"?`}
                </p>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => { setConfirmToggleClaimId(null); setConfirmToggleRawStatus(null); }}>Cancel</Button>
                  <Button size="sm" onClick={confirmAndToggle} disabled={updatingStatus === confirmToggleClaimId}>
                    {updatingStatus === confirmToggleClaimId ? 'Updating...' : 'Confirm'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Expert Reviews Reel Dialog */}
          {user && (
            <>
              <style>{`
                [data-radix-dialog-content] > button[data-radix-dialog-close]:first-of-type {
                  display: none;
                }
              `}</style>
              <Dialog open={!!showReelClaim} onOpenChange={() => setShowReelClaim(null)}>
                <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-screen h-screen sm:w-auto sm:h-[95vh] sm:max-h-[800px] max-w-none max-h-none sm:max-w-[90vw] p-0 m-0 rounded-none sm:rounded-lg overflow-hidden">
                  {/* Custom close button with dark transparent background */}
                  <DialogClose className="absolute right-4 top-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/70 transition-colors">
                    <X className="h-5 w-5 text-white" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                {currentReelClaim ? (
                  <div className="h-full w-full">
                    <VisuallyHidden>
                      <DialogTitle>Individual Expert Reviews</DialogTitle>
                    </VisuallyHidden>
                    <ExpertReviewsReel reviewCards={reviewCards} />
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">No reviews available.</div>
                )}
              </DialogContent>
            </Dialog>
            </>
          )}

          {/* Publication Review Dialog */}
          {user && (
            <PublicationReviewForm
              publication={reviewPublication}
              isOpen={!!reviewPublication}
              onClose={() => setReviewPublication(null)}
              onReviewSubmitted={() => {
                // refresh claims and expert distributions after an expert submits/updates a review
                fetchData(currentPage);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Claims;
