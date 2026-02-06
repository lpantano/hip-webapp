import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Tag, X, Search } from 'lucide-react';
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
import ExpertReviewsReel from './components/ExpertReviewsReel';
import { SourceFormDialog } from './components/SourceFormDialog';
import { EvidenceStatusFilter } from './components/EvidenceStatusFilter';
import { SortSegmentedControl } from './components/SortSegmentedControl';
import type { PublicationScoreRow } from './types';
import { CLAIM_LABELS } from '@/constants/labels';
import { getEvidenceStatusColor } from './utils/helpers';
import { useReviewCards } from './hooks/useReviewCards';
import { useClaimsQuery } from './hooks/useClaimsQuery';
import { CLAIMS_PER_PAGE, SPECIAL_CLAIM_ID, SEARCH_DEBOUNCE_MS } from './constants';

const Claims = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('recent');
  const [filterByLabel, setFilterByLabel] = useState<string>('all');
  const [selectedEvidenceStatuses, setSelectedEvidenceStatuses] = useState<string[]>([
    'Evidence Supports',
    'Evidence Disproves',
    'Inconclusive'
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [showSourceForm, setShowSourceForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [showEvidenceInfo, setShowEvidenceInfo] = useState<string | null>(null);
  const prevPageRef = useRef<number>(-1);
  const { user } = useAuth();

  // Fetch claims using TanStack Query
  const {
    data: queryData,
    isLoading: loading,
    error,
    refetch
  } = useClaimsQuery({
    page: currentPage,
    sortBy,
    filterByLabel,
    selectedEvidenceStatuses,
    debouncedSearchQuery,
    userId: user?.id || null
  });

  // Extract data from query result with defaults
  const claims = queryData?.claims || [];
  const totalClaims = queryData?.totalClaims || 0;
  const hasMoreClaims = queryData?.hasMoreClaims || false;
  const expertProfiles = queryData?.expertProfiles || {};
  const queryUserVotes = queryData?.userVotes || new Set<string>();

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

  // Track user votes from query
  const userVotes = queryUserVotes;

  // State for inline title editing
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState<string | null>(null);

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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Scroll restoration: save scroll position when navigating away
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem('claimsScrollPosition', window.scrollY.toString());
    };

    // Save scroll position before navigating away
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  // Restore scroll position on mount (when returning from evidence page)
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('claimsScrollPosition');
    if (savedPosition && !loading) {
      const position = parseInt(savedPosition, 10);
      setTimeout(() => {
        window.scrollTo({ top: position, behavior: 'instant' });
        sessionStorage.removeItem('claimsScrollPosition');
      }, 100);
    }
  }, [loading]);

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
  }, [filterByLabel, sortBy, debouncedSearchQuery, selectedEvidenceStatuses]);

  const handleVote = async (id: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    const hasVoted = userVotes.has(id);

    try {
      if (hasVoted) {
        const { error: delError } = await sb.from('claim_votes').delete().eq('claim_id', id).eq('user_id', user.id);
        if (delError) throw delError;
      } else {
        const { error: insertError } = await sb.from('claim_votes').insert({ claim_id: id, user_id: user.id });
        if (insertError) throw insertError;
      }
      // Refetch claims data to update vote counts and user votes
      refetch();
    } catch (err) {
      console.error('Vote failed:', err);
      toast.error('Failed to update vote');
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
      await refetch();
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
              Upvote Claims to prioritize them for expert review.
            </p>
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
              <div className="flex flex-col gap-4 mb-8 w-full max-w-3xl mx-auto px-4">
                {/* Top row: New Claim button and Search */}
                <div className="flex flex-row gap-2 sm:gap-4 items-center justify-center">
                  <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 whitespace-nowrap h-9 px-2 sm:px-4" disabled={!user}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{user ? 'New Claim' : 'Sign in to Submit Claim'}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-screen h-screen max-w-none max-h-none p-4 sm:p-6 m-0 rounded-none sm:w-auto sm:h-auto sm:max-w-[90vw] md:max-w-4xl sm:max-h-[90vh] sm:rounded-lg overflow-y-auto">
                      <DialogTitle>Submit a new claim</DialogTitle>
                      <ClaimSubmissionForm
                        onSuccess={() => {
                          setShowSubmissionForm(false);
                          refetch();
                        }}
                        onCancel={() => setShowSubmissionForm(false)}
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-[280px]">
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
                </div>

                {/* Filter dropdowns: 2-column grid on mobile, flex row on desktop */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center">
                  <EvidenceStatusFilter
                    selectedStatuses={selectedEvidenceStatuses}
                    onStatusChange={setSelectedEvidenceStatuses}
                  />

                  <Select value={filterByLabel} onValueChange={setFilterByLabel}>
                    <SelectTrigger className="w-full sm:w-[160px] h-9">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Topic" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Topics</SelectItem>
                      {CLAIM_LABELS.map((label) => (
                        <SelectItem key={label.value} value={label.value}>
                          {label.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <SortSegmentedControl value={sortBy} onChange={setSortBy} />
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
                onTitleUpdate={updateClaimTitle}
                onShowReel={setShowReelClaim}
                onShowPaperForm={setShowPaperForm}
                onShowSourceForm={setShowSourceForm}
                onShowEvidenceInfo={setShowEvidenceInfo}
                editingClaimId={editingClaimId}
                setEditingClaimId={setEditingClaimId}
                updatingTitle={updatingTitle}
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
                          refetch();
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
                refetch();
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
