import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink, Plus, Filter, X, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import PublicClaimsPreview from '@/components/landing/PublicClaimsPreview';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ClaimCard } from './components/ClaimCard';
import CategoriesLegend from './components/Legend';
import ExpertReviewsReel from './components/ExpertReviewsReel';
import { SourceFormDialog } from './components/SourceFormDialog';
import { EvidenceStatusFilter } from './components/EvidenceStatusFilter';
import type { Database } from '@/integrations/supabase/types';
import type { ClaimUI, ClaimRow, ClaimCommentRow, PublicationRow, ClaimLinkRow, PublicationScoreRow } from './types';
import { CLAIM_CATEGORIES_WITH_ALL } from '@/constants/categories';
import { BROAD_CATEGORIES_WITH_ALL } from '@/constants/broadCategories';
import { CLAIM_LABELS } from '@/constants/labels';
import { getEvidenceStatusColor, groupBy } from './utils/helpers';
import { useOptimisticVote } from './hooks/useOptimisticVote';
import { useReviewCards } from './hooks/useReviewCards';
import { CLAIMS_PER_PAGE, SPECIAL_CLAIM_ID, SEARCH_DEBOUNCE_MS } from './constants';

const Claims = () => {
  const [searchParams] = useSearchParams();
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [hasMoreClaims, setHasMoreClaims] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('recent');
  const [filterByCategory, setFilterByCategory] = useState<Database['public']['Enums']['claim_category'] | 'all'>('all');
  const [filterByBroadCategory, setFilterByBroadCategory] = useState<Database['public']['Enums']['broad_category_type'] | 'all'>('all');
  const [filterByLabel, setFilterByLabel] = useState<string>('all');
  const [selectedEvidenceStatuses, setSelectedEvidenceStatuses] = useState<string[]>([
    'Evidence Supports',
    'Evidence Disproves',
    'Inconclusive'
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [showSourceForm, setShowSourceForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedStance, setExpandedStance] = useState<{ claimId: string; stance: 'supporting' | 'contradicting' } | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [showEvidenceInfo, setShowEvidenceInfo] = useState<string | null>(null);
  const prevPageRef = useRef<number>(-1);
  const { user } = useAuth();

  // Read search and label parameters from URL on mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    const labelParam = searchParams.get('label');
    if (labelParam) {
      setFilterByLabel(labelParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Use custom hook for optimistic vote updates
  const {
    userVotes,
    optimisticallyAddVote,
    optimisticallyRemoveVote,
    revertVote,
    setUserVotes
  } = useOptimisticVote(setClaims);

  // State for inline title editing
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState<string | null>(null);

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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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

      // Apply broad category filter
      if (filterByBroadCategory !== 'all') {
        claimsQuery = claimsQuery.eq('broad_category', filterByBroadCategory);
      }

      // Apply label filter
      if (filterByLabel !== 'all') {
        claimsQuery = claimsQuery.contains('labels', [filterByLabel]);
      }

      // Apply search filter
      if (debouncedSearchQuery.trim()) {
        claimsQuery = claimsQuery.ilike('title', `%${debouncedSearchQuery.trim()}%`);
      }

      // Apply evidence status filter
      if (selectedEvidenceStatuses.length > 0 && selectedEvidenceStatuses.length < 4) {
        const hasAwaitingEvidence = selectedEvidenceStatuses.includes('Awaiting Evidence');
        const otherStatuses = selectedEvidenceStatuses.filter(s => s !== 'Awaiting Evidence');

        if (hasAwaitingEvidence && otherStatuses.length > 0) {
          // Combine NULL check + enum values with OR
          const statusList = otherStatuses.map(s => `"${s}"`).join(',');
          claimsQuery = claimsQuery.or(
            `evidence_status.is.null,evidence_status.eq.Awaiting Evidence,evidence_status.in.(${statusList})`
          );
        } else if (hasAwaitingEvidence) {
          // Only awaiting evidence (includes NULL)
          claimsQuery = claimsQuery.or('evidence_status.is.null,evidence_status.eq.Awaiting Evidence');
        } else if (otherStatuses.length === 1) {
          // Single specific status - use equality for efficiency
          claimsQuery = claimsQuery.eq('evidence_status', otherStatuses[0] as Database['public']['Enums']['evidence_status_type']);
        } else {
          // Multiple specific statuses (not awaiting evidence)
          claimsQuery = claimsQuery.in('evidence_status', otherStatuses as Database['public']['Enums']['evidence_status_type'][]);
        }
      }
      // If all 4 selected or empty, no filter applied (shows all claims)

      // Apply sorting with secondary keys for stable pagination
      // Secondary sort keys ensure consistent ordering even when primary values change
      if (sortBy === 'votes') {
        // Sort by vote_count, then by created_at (desc), then by id for complete stability
        claimsQuery = claimsQuery
          .order('vote_count', { ascending: false })
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
      } else {
        // Sort by created_at, then by id for stability
        claimsQuery = claimsQuery
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
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
          broad_category: c.broad_category,
          labels: c.labels || [],
          votes: c.vote_count || 0,
          created_at: c.created_at,
          publications: pubs,
          links: (linksByClaim[c.id] || []).map(l => ({ id: l.id, title: l.title, url: l.url, description: l.description, link_type: l.link_type, expert_user_id: l.expert_user_id })),
          comments: commentsByClaim[c.id] || [],
          // preserve DB enum/status values directly as requested
          rawStatus: c.status,
          status: c.status as ClaimUI['status'],
          evidence_status: 'evidence_status' in c ? (c.evidence_status as ClaimUI['evidence_status']) : null
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
  }, [sb, user, filterByCategory, filterByBroadCategory, filterByLabel, sortBy, debouncedSearchQuery, selectedEvidenceStatuses, setUserVotes]);

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

  // Scroll to top when page changes and data has finished loading
  useEffect(() => {
    // Only scroll if page changed (skip initial load when prevPageRef is 0 and currentPage is 0)
    const pageChanged = prevPageRef.current !== currentPage;
    if (pageChanged && !loading && prevPageRef.current !== -1) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
    // Update ref after checking
    if (pageChanged) {
      prevPageRef.current = currentPage;
    }
  }, [currentPage, loading]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    setCurrentPage(0);
  }, [filterByCategory, filterByBroadCategory, filterByLabel, sortBy, debouncedSearchQuery, selectedEvidenceStatuses]);

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

  const handleStanceClick = (claimId: string, stance: 'supporting' | 'contradicting') => {
    // Toggle: if clicking same stance on same claim, collapse it
    if (expandedStance?.claimId === claimId && expandedStance?.stance === stance) {
      setExpandedStance(null);
    } else {
      // Otherwise expand the clicked stance
      setExpandedStance({ claimId, stance });
    }
  };

  // Update claim title with validation
  const updateClaimTitle = async (claimId: string, newTitle: string) => {
    if (!user) return;

    // Validation
    const trimmed = newTitle.trim();
    if (trimmed.length < 10) {
      toast.error('Validation error', {
        description: 'Title must be at least 10 characters'
      });
      return;
    }

    try {
      setUpdatingTitle(claimId);
      const { error } = await sb
        .from('claims')
        .update({ title: trimmed })
        .eq('id', claimId);

      if (error) throw error;

      // Refresh data
      await fetchData(currentPage);
      toast.success('Title updated', {
        description: 'Claim title has been updated successfully.'
      });
      setEditingClaimId(null);
    } catch (e: unknown) {
      console.error('Failed to update claim title', e);
      const msg = e instanceof Error ? e.message : 'Failed to update title';
      toast.error('Update failed', { description: msg });
    } finally {
      setUpdatingTitle(null);
    }
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
      <SEO
        title="Health Claims"
        description="Community-driven claims about products and services for women's health conditions. Expert-reviewed scientific evidence and research."
        url="/claims"
        keywords="health claims, women's health, scientific evidence, expert reviews, health research, medical claims"
      />
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
              {/* Show PublicClaimsPreview for anonymous users */}
              {!user ? (
                <PublicClaimsPreview />
              ) : (
                <>
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
                    <DialogContent className="w-screen h-screen max-w-none max-h-none p-4 sm:p-6 m-0 rounded-none sm:w-auto sm:h-auto sm:max-w-[90vw] md:max-w-4xl sm:max-h-[90vh] sm:rounded-lg overflow-y-auto">
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

                  {/* Search Input */}
                  <div className="relative w-full sm:w-[240px]">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      type="text"
                      placeholder="Search claims..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 h-9"
                      aria-label="Search claims by title"
                      role="searchbox"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                        type="button"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <Select value={filterByBroadCategory} onValueChange={(value) => setFilterByBroadCategory(value as typeof filterByBroadCategory)}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue placeholder="Broad Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {BROAD_CATEGORIES_WITH_ALL.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterByLabel} onValueChange={setFilterByLabel}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue placeholder="Topic Label" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Labels</SelectItem>
                      {CLAIM_LABELS.map((label) => (
                        <SelectItem key={label.value} value={label.value}>
                          {label.label}
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

              {/* Evidence Status Filter - New horizontal row */}
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-3xl px-4">
                  <EvidenceStatusFilter
                    selectedStatuses={selectedEvidenceStatuses}
                    onStatusChange={setSelectedEvidenceStatuses}
                  />
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
                  <p>
                    {debouncedSearchQuery.trim()
                      ? 'No claims match your search.'
                      : 'No claims found for the selected category.'}
                  </p>
                </div>
              )}
              {filteredAndSortedClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                userVotes={userVotes}
                expertProfiles={expertProfiles}
                isExpert={isExpert}
                user={user}
                onVote={handleVote}
                onStanceClick={handleStanceClick}
                onTitleUpdate={updateClaimTitle}
                onShowReel={setShowReelClaim}
                onShowPaperForm={setShowPaperForm}
                onShowSourceForm={setShowSourceForm}
                onShowEvidenceInfo={setShowEvidenceInfo}
                expandedStance={expandedStance}
                editingClaimId={editingClaimId}
                setEditingClaimId={setEditingClaimId}
                updatingTitle={updatingTitle}
                setReviewPublication={setReviewPublication}
                showShareButton={false}
              />
            ))}

            {/* Pagination Controls */}
            {totalClaims > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 p-4 bg-card/30 rounded-lg border">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {currentPage * CLAIMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * CLAIMS_PER_PAGE, totalClaims)} of {totalClaims} claims
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0 || loading}
                    className="min-w-[40px] sm:min-w-[44px] touch-manipulation"
                    aria-label="First page"
                  >
                    {loading && currentPage === 0 ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <ChevronsLeft className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                    className="min-w-[40px] sm:min-w-[44px] touch-manipulation"
                    aria-label="Previous page"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
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
                    className="min-w-[40px] sm:min-w-[44px] touch-manipulation"
                    aria-label="Next page"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.ceil(totalClaims / CLAIMS_PER_PAGE) - 1)}
                    disabled={!hasMoreClaims || loading || currentPage === Math.ceil(totalClaims / CLAIMS_PER_PAGE) - 1}
                    className="min-w-[40px] sm:min-w-[44px] touch-manipulation"
                    aria-label="Last page"
                  >
                    {loading && !hasMoreClaims ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <ChevronsRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Anonymous User CTA - Removed since anonymous users now see PublicClaimsPreview */}
              </>
              )}
            </TabsContent>

            {/* <TabsContent value="trusted-resources" className="space-y-6">
              <ResourcesSection />
            </TabsContent> */}
          </Tabs>

          {/* Paper Submission Dialog */}
          {user && showPaperForm && (
            <Dialog open={!!showPaperForm} onOpenChange={() => setShowPaperForm(null)}>
              <DialogContent className="w-screen h-screen max-w-none max-h-none p-4 sm:p-6 m-0 rounded-none sm:w-auto sm:h-auto sm:max-w-[90vw] md:max-w-4xl sm:max-h-[90vh] sm:rounded-lg overflow-y-auto">
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

          {/* Expert Reviews Reel Dialog */}
          {user && (
            <>
              <style>{`
                [data-radix-dialog-content] > button[data-radix-dialog-close]:first-of-type {
                  display: none;
                }
              `}</style>
              <Dialog open={!!showReelClaim} onOpenChange={() => setShowReelClaim(null)}>
                <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-screen h-screen sm:w-auto sm:h-[95vh] sm:max-h-[800px] max-w-none max-h-none sm:max-w-[650px] p-0 m-0 rounded-none sm:rounded-lg overflow-hidden">
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
                    <ExpertReviewsReel reviewCards={reviewCards} onClose={() => setShowReelClaim(null)} />
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

          {/* Evidence Info Dialog */}
          {user && showEvidenceInfo && (
            <Dialog open={!!showEvidenceInfo} onOpenChange={() => setShowEvidenceInfo(null)}>
              <DialogContent className="w-screen h-screen max-w-none max-h-none p-4 sm:p-6 m-0 rounded-none sm:w-auto sm:h-auto sm:max-w-[600px] sm:max-h-[90vh] sm:rounded-lg overflow-y-auto">
                <DialogTitle>Understanding Evidence</DialogTitle>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Evidence Status</h3>
                    <p className="text-muted-foreground mb-3">
                      The evidence status badge indicates the overall quality and reliability of evidence for this claim based on expert reviews:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Badge className={`${getEvidenceStatusColor('Awaiting Evidence')} pointer-events-none transition-none flex-shrink-0`}>
                          Awaiting Evidence
                        </Badge>
                        <span className="text-muted-foreground">This claim has not yet been reviewed by experts or lacks supporting publications.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className={`${getEvidenceStatusColor('Evidence Supports')} pointer-events-none transition-none flex-shrink-0`}>
                          Evidence Supports
                        </Badge>
                        <span className="text-muted-foreground">Expert reviews indicate that scientific evidence supports this claim.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className={`${getEvidenceStatusColor('Evidence Disproves')} pointer-events-none transition-none flex-shrink-0`}>
                          Evidence Disproves
                        </Badge>
                        <span className="text-muted-foreground">Expert reviews indicate that scientific evidence contradicts this claim.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className={`${getEvidenceStatusColor('Inconclusive')} pointer-events-none transition-none flex-shrink-0`}>
                          Inconclusive
                        </Badge>
                        <span className="text-muted-foreground">Expert reviews show mixed or insufficient evidence for this claim.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Paper Stances</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div>
                        <strong>Reported to Support:</strong> Papers that have been reported by sources to support this claim.
                      </div>
                      <div>
                        <strong>Reported to Disprove:</strong> Papers that have been reported by sources to disprove or contradict this claim.
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
};

export default Claims;
