import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { FileText, ExternalLink, X, MapPin, Clock, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { aggregatePublicationReviewData } from '@/lib/label-aggregation';
import { getCategoryBackgroundColor, getStudyTagColor, getCategoryDescription, getStudyTagDescription } from '@/lib/classification-categories';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import ClaimLinksSection from './ClaimLinksSection';
import ExpertReviewsReel from './ExpertReviewsReel';
import type { ExpertReviewCard } from './ExpertReviewsReel';
import type { PublicationScoreRow } from '../types';
import type { ReviewCategory } from '@/types/review';

type Publication = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  source?: string | null;
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  submitted_by?: string | null;
  rawScores?: PublicationScoreRow[];
};

type LinkRow = {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
};

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

/* ── Truncatable insight callout ── */
const ReviewerInsightCallout: React.FC<{ content: string }> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkClamp = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    checkClamp();
    // Re-check after fonts / images load
    window.addEventListener('resize', checkClamp);
    return () => window.removeEventListener('resize', checkClamp);
  }, [checkClamp, content]);

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-md p-3 sm:p-4 mb-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Reviewer Insight
        </span>
      </div>
      <div
        ref={contentRef}
        className={expanded ? '' : 'line-clamp-3'}
      >
        <MarkdownRenderer content={content} className="text-foreground/80" />
      </div>
      {(isClamped || expanded) && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

/* ── Truncated paper title (2-line clamp, tap to expand) ── */
const TruncatedTitle: React.FC<{ title: string }> = ({ title }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkClamp = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    checkClamp();
    window.addEventListener('resize', checkClamp);
    return () => window.removeEventListener('resize', checkClamp);
  }, [checkClamp, title]);

  return (
    <div className="mb-3">
      <h5
        ref={titleRef}
        onClick={() => isClamped && setExpanded(true)}
        className={`text-sm sm:text-base text-muted-foreground leading-snug ${!expanded ? 'line-clamp-2' : ''} ${isClamped && !expanded ? 'cursor-pointer' : ''}`}
      >
        {title}
      </h5>
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-1 text-xs font-medium text-primary hover:underline cursor-pointer"
        >
          Show less
        </button>
      )}
    </div>
  );
};

const ClaimPublicationsExpanded: React.FC<{
  publications: Publication[];
  links?: LinkRow[];
  isExpert: boolean;
  isAdmin: boolean;
  user: { id?: string; role?: string } | null;
  setReviewPublication: (p: { id: string; title: string; journal: string; publication_year: number; authors?: string; url?: string; existingReview?: PublicationScoreRow | null } | null) => void;
  getStanceIcon: (stance: Publication['stance']) => React.ReactNode;
  expertProfiles: Record<string, ExpertProfile>;
  onDeletePublication: (publicationId: string) => Promise<void>;
}> = ({ publications, links, isExpert, isAdmin, user, setReviewPublication, getStanceIcon, expertProfiles, onDeletePublication }) => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [pubToDelete, setPubToDelete] = useState<Publication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = (pub: Publication): boolean => {
    if (!user?.id) return false;
    return isAdmin || isExpert || pub.submitted_by === user.id;
  };

  // Transform publication's rawScores into ExpertReviewCard format
  const publicationReviewCards = useMemo((): ExpertReviewCard[] => {
    if (!selectedPublication || !selectedPublication.rawScores) return [];

    const reviewCards: ExpertReviewCard[] = [];
    const publicationStance = selectedPublication.stance as 'supporting' | 'contradicting' | null;

    // Group scores by expert
    const scoresByExpert: Record<string, PublicationScoreRow[]> = {};
    selectedPublication.rawScores.forEach(score => {
      if (!scoresByExpert[score.expert_user_id]) {
        scoresByExpert[score.expert_user_id] = [];
      }
      scoresByExpert[score.expert_user_id].push(score);
    });

    // Create individual cards for each expert who reviewed this publication
    Object.entries(scoresByExpert).forEach(([expertUserId, scores]) => {
      const expertProfile = expertProfiles[expertUserId];

      // Pick the latest review row for this expert
      const latestRow = scores.reduce((a, b) => {
        const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bTime >= aTime ? b : a;
      }, scores[0]);

      // Build quality check scores
      const expertScores: Array<{ category: string; score?: 'PASS' | 'NO' | 'NA' | null }> = [
        { category: 'studyDesign', score: latestRow?.review_data?.qualityChecks?.studyDesign ?? null },
        { category: 'statistics', score: latestRow?.review_data?.qualityChecks?.statistics ?? null },
        { category: 'controlGroup', score: latestRow?.review_data?.qualityChecks?.controlGroup ?? null },
        { category: 'biasAddressed', score: latestRow?.review_data?.qualityChecks?.biasAddressed ?? null }
      ];

      // Get comments from the review
      const comments = [];
      if (latestRow?.comments) {
        comments.push({
          content: latestRow.comments,
          created_at: latestRow.updated_at || latestRow.created_at || ''
        });
      }

      reviewCards.push({
        publication: {
          id: selectedPublication.id,
          title: selectedPublication.title,
          journal: selectedPublication.journal,
          year: selectedPublication.year,
          authors: selectedPublication.authors,
          source: selectedPublication.source || null
        },
        expert: {
          expert_user_id: expertUserId,
          display_name: expertProfile?.display_name,
          avatar_url: expertProfile?.avatar_url,
          scores: expertScores,
          comments: comments,
          classification: latestRow?.review_data?.category ?? null,
          tags: latestRow?.review_data?.tags ?? null,
          womenNotIncluded: latestRow?.review_data?.womenNotIncluded ?? false,
          reviewData: latestRow?.review_data ?? null,
          stance: publicationStance
        }
      });
    });

    return reviewCards;
  }, [selectedPublication, expertProfiles]);

  // Extract the first reviewer insight comment for a publication
  const getReviewerInsight = (pub: Publication): string | null => {
    if (!pub.rawScores || pub.rawScores.length === 0) return null;
    // Find the latest review with a comment
    const withComments = pub.rawScores
      .filter(rs => rs.comments)
      .sort((a, b) => {
        const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bTime - aTime;
      });
    return withComments.length > 0 ? withComments[0].comments : null;
  };

  // Get unique expert IDs who reviewed a publication
  const getReviewerIds = (pub: Publication): string[] => {
    if (!pub.rawScores) return [];
    const ids = new Set<string>();
    pub.rawScores.forEach(rs => {
      if (rs.expert_user_id) ids.add(rs.expert_user_id);
    });
    return Array.from(ids);
  };

  return (
    <>
      {/* Links Section */}
      {links && links.length > 0 && (
        <div className="mb-4 flex justify-end">
          <ClaimLinksSection links={links} />
        </div>
      )}

      <div className="space-y-4">
        {publications.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No papers yet for this stance
          </div>
        ) : (
          publications.map((pub, pubIndex) => {
            const agg = aggregatePublicationReviewData({ rawScores: pub.rawScores });
            const reviewerInsight = getReviewerInsight(pub);
            const reviewerIds = getReviewerIds(pub);
            const maxAvatars = 3;
            const visibleReviewers = reviewerIds.slice(0, maxAvatars);
            const remainingCount = Math.max(0, reviewerIds.length - maxAvatars);

            return (
              <div key={pubIndex} className="bg-card rounded-lg border border-border p-4 sm:p-5 shadow-sm">
                {/* Top: Badges row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {agg.clinicalTrialCount > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className={`inline-flex items-center rounded-md ${getStudyTagColor('clinical trial')} px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide cursor-pointer`}>
                          Clinical Trial
                        </span>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        {getStudyTagDescription('Clinical Trial')}
                      </PopoverContent>
                    </Popover>
                  )}
                  {agg.observationalCount > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className={`inline-flex items-center rounded-md ${getStudyTagColor('observational')} px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide cursor-pointer`}>
                          Observational
                        </span>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        {getStudyTagDescription('Observational')}
                      </PopoverContent>
                    </Popover>
                  )}
                  {Object.entries(agg.classificationCounts).map(([label]) => (
                    <Popover key={label}>
                      <PopoverTrigger asChild>
                        <span className={`inline-flex items-center rounded-md ${getCategoryBackgroundColor(label)} px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide cursor-pointer`}>
                          {label}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        <div className="font-semibold mb-1">{label}</div>
                        <div>{getCategoryDescription(label as ReviewCategory)}</div>
                      </PopoverContent>
                    </Popover>
                  ))}
                  {agg.womenNotIncludedCount > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className={`inline-flex items-center rounded-md ${getStudyTagColor('women_not_included')} px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide cursor-pointer`}>
                          Women Not Included
                        </span>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        {getStudyTagDescription('Women Not Included')}
                      </PopoverContent>
                    </Popover>
                  )}
                  {reviewerIds.length === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      Awaiting Review
                    </span>
                  )}
                </div>

                {/* Paper Title */}
                <TruncatedTitle title={pub.title} />

                {/* Reviewer Insight Callout */}
                {reviewerInsight && (
                  <ReviewerInsightCallout content={reviewerInsight} />
                )}

                {/* Bottom row: Avatars + Read Full Paper */}
                <div className="flex items-center justify-between">
                  {/* Left: Expert avatar group */}
                  <div className="flex items-center gap-2">
                    {reviewerIds.length > 0 ? (
                      <button
                        onClick={() => setSelectedPublication(pub)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                        title={`View ${reviewerIds.length} expert review${reviewerIds.length === 1 ? '' : 's'}`}
                      >
                        <div className="flex -space-x-2">
                          {visibleReviewers.map(expertId => {
                            const profile = expertProfiles[expertId];
                            return profile?.avatar_url ? (
                              <img
                                key={expertId}
                                src={profile.avatar_url}
                                alt={profile.display_name || 'Reviewer'}
                                className="w-8 h-8 rounded-full border-2 border-background object-cover"
                              />
                            ) : (
                              <div
                                key={expertId}
                                className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary"
                              >
                                {(profile?.display_name || '?').charAt(0).toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                        {remainingCount > 0 && (
                          <span className="text-sm text-muted-foreground font-medium">
                            +{remainingCount}
                          </span>
                        )}
                      </button>
                    ) : null}

                    {/* Expert review button */}
                    {(isExpert || user?.role === 'admin' || user?.role === 'researcher') && (() => {
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
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {reviewButtonText}
                        </Button>
                      );
                    })()}

                    {/* Delete button */}
                    {canDelete(pub) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPubToDelete(pub)}
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Right: Read Full Paper link */}
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Read Full Paper
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pubToDelete} onOpenChange={(open) => { if (!open) setPubToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this paper?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{pubToDelete?.title}&rdquo; from this claim. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pubToDelete) return;
                setIsDeleting(true);
                try {
                  await onDeletePublication(pubToDelete.id);
                  setPubToDelete(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publication Reviews Dialog */}
      <>
        <style>{`
          [data-radix-dialog-content] > button[data-radix-dialog-close]:first-of-type {
            display: none;
          }
        `}</style>
        <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
          <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-screen h-screen sm:w-auto sm:h-[95vh] sm:max-h-[800px] max-w-none max-h-none sm:max-w-[90vw] p-0 m-0 rounded-none sm:rounded-lg overflow-hidden">
            {/* Custom close button with dark transparent background */}
            <DialogClose className="absolute right-4 top-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/70 transition-colors">
              <X className="h-5 w-5 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {selectedPublication && publicationReviewCards.length > 0 ? (
              <div className="h-full w-full">
                <VisuallyHidden>
                  <DialogTitle>Expert Reviews for {selectedPublication.title}</DialogTitle>
                </VisuallyHidden>
                <ExpertReviewsReel reviewCards={publicationReviewCards} onClose={() => setSelectedPublication(null)} />
              </div>
            ) : selectedPublication && publicationReviewCards.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <VisuallyHidden>
                  <DialogTitle>No Reviews Available</DialogTitle>
                </VisuallyHidden>
                <div className="text-center text-base text-muted-foreground">
                  No reviews available for this paper yet.
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </>
    </>
  );
};

export default ClaimPublicationsExpanded;
