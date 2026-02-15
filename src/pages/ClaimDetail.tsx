import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { ArrowLeft, ExternalLink, X, Share, LogIn } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SEO } from '@/components/SEO';
import { ClaimCard } from '@/pages/Claims/components/ClaimCard';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import ExpertReviewsReel from '@/pages/Claims/components/ExpertReviewsReel';
import { SourceFormDialog } from '@/pages/Claims/components/SourceFormDialog';
import { useClaimData } from '@/pages/Claims/hooks/useClaimData';
import { useOptimisticVote } from '@/pages/Claims/hooks/useOptimisticVote';
import { useReviewCards } from '@/pages/Claims/hooks/useReviewCards';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ClaimUI, PublicationScoreRow } from '@/pages/Claims/types';

const ClaimDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { claim, expertProfiles, loading, error, refetch } = useClaimData(id || null);

  // State for dialogs and interactions
  const [showPaperForm, setShowPaperForm] = useState(false);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showReelClaim, setShowReelClaim] = useState(false);
  const [showEvidenceInfo, setShowEvidenceInfo] = useState(false);
  const [reviewPublication, setReviewPublication] = useState<{
    id: string;
    title: string;
    journal: string;
    publication_year: number;
    authors?: string;
    abstract?: string;
    doi?: string;
    url?: string;
    existingReview?: PublicationScoreRow | null;
  } | null>(null);
  const [expandedStance, setExpandedStance] = useState<{
    claimId: string;
    stance: 'supporting' | 'contradicting';
  } | null>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState<string | null>(null);
  const [isExpert, setIsExpert] = useState(false);

  // Create a claims array for useOptimisticVote (it expects an array)
  const [claims, setClaims] = useState<ClaimUI[]>([]);

  // Update claims array when claim data changes
  useEffect(() => {
    if (claim) {
      setClaims([claim]);
    } else {
      setClaims([]);
    }
  }, [claim]);

  // Use optimistic vote hook
  const { userVotes, optimisticallyAddVote, optimisticallyRemoveVote, revertVote, setUserVotes } =
    useOptimisticVote(setClaims);

  // Check expert status
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpert(false);
        return;
      }

      try {
        const { data: expertData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'expert'
        });

        const { data: researcherData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'researcher'
        });

        setIsExpert((expertData || false) || (researcherData || false));
      } catch (error) {
        console.error('Error checking expert/researcher status:', error);
        setIsExpert(false);
      }
    };

    checkExpertStatus();
  }, [user]);

  // Fetch user's vote status for this claim
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user || !claim) return;

      try {
        const { data, error } = await supabase
          .from('claim_votes')
          .select('claim_id')
          .eq('user_id', user.id)
          .eq('claim_id', claim.id);

        if (!error && data) {
          setUserVotes(new Set(data.map((v) => v.claim_id)));
        }
      } catch (err) {
        console.error('Error fetching user vote:', err);
      }
    };

    fetchUserVote();
  }, [user, claim, setUserVotes]);

  // Allow anonymous users to view claim details
  // No redirect needed - they can view but not interact

  // Handle vote
  const handleVote = async (claimId: string) => {
    if (!user) return;

    const hasVoted = userVotes.has(claimId);

    // Optimistic update
    if (hasVoted) {
      optimisticallyRemoveVote(claimId);
    } else {
      optimisticallyAddVote(claimId);
    }

    try {
      if (hasVoted) {
        const { error: delError } = await supabase
          .from('claim_votes')
          .delete()
          .eq('claim_id', claimId)
          .eq('user_id', user.id);
        if (delError) throw delError;
      } else {
        const { error: insertError } = await supabase
          .from('claim_votes')
          .insert({ claim_id: claimId, user_id: user.id });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Vote failed:', err);
      revertVote(claimId, !hasVoted);
    }
  };

  // Handle stance click
  const handleStanceClick = (claimId: string, stance: 'supporting' | 'contradicting') => {
    if (expandedStance?.claimId === claimId && expandedStance?.stance === stance) {
      setExpandedStance(null);
    } else {
      setExpandedStance({ claimId, stance });
    }
  };

  // Handle title update
  const handleTitleUpdate = async (claimId: string, newTitle: string) => {
    if (!user) return;

    const trimmed = newTitle.trim();
    if (trimmed.length < 10) {
      toast.error('Validation error', {
        description: 'Title must be at least 10 characters'
      });
      return;
    }

    try {
      setUpdatingTitle(claimId);
      const { error } = await supabase.from('claims').update({ title: trimmed }).eq('id', claimId);

      if (error) throw error;

      await refetch();
      toast.success('Title updated', {
        description: 'Claim title has been updated successfully.'
      });
    } catch (e) {
      console.error('Failed to update claim title', e);
      const msg = e instanceof Error ? e.message : 'Failed to update title';
      toast.error('Update failed', { description: msg });
    } finally {
      setUpdatingTitle(null);
    }
  };

  // Handle share button
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!', {
        description: 'Share this link to show others this claim.'
      });
    } catch (err) {
      toast.error('Failed to copy link', {
        description: 'Please copy the URL from your browser.'
      });
    }
  };

  // Generate review cards for reel
  const reviewCards = useReviewCards(claim || undefined, expertProfiles);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading claim...
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error/404 state
  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-8 border border-border shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Claim Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error?.message === 'Claim not found'
                    ? "This claim doesn't exist or may have been removed."
                    : 'An error occurred while loading this claim.'}
                </p>
                <Button asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    View All Claims
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <SEO
        title={claim.claim}
        description={`Expert-reviewed evidence for: ${claim.claim.substring(0, 150)}${claim.claim.length > 150 ? '...' : ''}`}
        url={`/claims/${claim.id}`}
        type="article"
        keywords={`${claim.category}, ${claim.broad_category}, women's health, health claims, scientific evidence`}
        publishedTime={claim.created_at}
      />
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Navigation and Share Section */}
          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                All Claims
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Info Section */}
          <div className="max-w-4xl mx-auto mb-8 text-center px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              <a href="/workflow" className="inline-flex items-center gap-2 text-primary hover:underline">
                Learn how we review information and science
                <ExternalLink className="w-4 h-4" />
              </a>
            </p>
          </div>

          {/* Claim Card */}
          <div className="max-w-4xl mx-auto">
            <ClaimCard
              claim={claim}
              userVotes={userVotes}
              expertProfiles={expertProfiles}
              isExpert={isExpert}
              user={user}
              onVote={handleVote}
              onStanceClick={handleStanceClick}
              onTitleUpdate={handleTitleUpdate}
              onShowReel={() => setShowReelClaim(true)}
              onShowPaperForm={() => setShowPaperForm(true)}
              onShowSourceForm={() => setShowSourceForm(true)}
              onShowEvidenceInfo={() => setShowEvidenceInfo(true)}
              expandedStance={expandedStance}
              editingClaimId={editingClaimId}
              setEditingClaimId={setEditingClaimId}
              updatingTitle={updatingTitle}
              setReviewPublication={setReviewPublication}
              showShareButton={true}
              onShare={handleShare}
            />
          </div>

          {/* Anonymous User CTA */}
          {!user && (
            <div className="max-w-4xl mx-auto mt-8">
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 border border-border text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to vote, comment, and contribute to this claim.
                </p>
                <Button asChild>
                  <Link to="/auth" className="flex items-center gap-2 mx-auto">
                    <LogIn className="w-4 h-4" />
                    Sign In to Participate
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Paper Submission Dialog */}
      {user && showPaperForm && claim && (
        <Dialog open={showPaperForm} onOpenChange={setShowPaperForm}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Add paper</DialogTitle>
            <PaperSubmissionForm
              claimId={claim.id}
              claimTitle={claim.claim}
              onSuccess={() => {
                setShowPaperForm(false);
                refetch();
              }}
              onCancel={() => setShowPaperForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Source Form Dialog */}
      {user && showSourceForm && claim && (
        <SourceFormDialog
          isOpen={showSourceForm}
          onClose={() => setShowSourceForm(false)}
          claimId={claim.id}
          userId={user.id}
          onSuccess={() => refetch()}
        />
      )}

      {/* Expert Reviews Reel Dialog */}
      {user && showReelClaim && (
        <>
          <style>{`
            [data-radix-dialog-content] > button[data-radix-dialog-close]:first-of-type {
              display: none;
            }
          `}</style>
          <Dialog open={showReelClaim} onOpenChange={() => setShowReelClaim(false)}>
            <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-screen h-screen sm:w-auto sm:h-[95vh] sm:max-h-[800px] max-w-none max-h-none sm:max-w-[650px] p-0 m-0 rounded-none sm:rounded-lg overflow-hidden">
              <DialogClose className="absolute right-4 top-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/70 transition-colors">
                <X className="h-5 w-5 text-white" />
                <span className="sr-only">Close</span>
              </DialogClose>
              <div className="h-full w-full">
                <VisuallyHidden>
                  <DialogTitle>Individual Expert Reviews</DialogTitle>
                </VisuallyHidden>
                <ExpertReviewsReel reviewCards={reviewCards} onClose={() => setShowReelClaim(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Publication Review Form */}
      {user && (
        <PublicationReviewForm
          publication={reviewPublication}
          isOpen={!!reviewPublication}
          onClose={() => setReviewPublication(null)}
          onReviewSubmitted={() => refetch()}
        />
      )}

      {/* Evidence Info Dialog */}
      {user && showEvidenceInfo && (
        <Dialog open={showEvidenceInfo} onOpenChange={() => setShowEvidenceInfo(false)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogTitle>Understanding Evidence</DialogTitle>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Evidence Status</h3>
                <p className="text-muted-foreground mb-3">
                  The evidence status badge indicates the overall quality and reliability of evidence for
                  this claim based on expert reviews.
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Paper Stances</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <strong>Reported to Support:</strong> Papers that have been reported by sources to
                    support this claim.
                  </div>
                  <div>
                    <strong>Reported to Disprove:</strong> Papers that have been reported by sources to
                    disprove or contradict this claim.
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClaimDetail;
