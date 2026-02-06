import React, { useState, useMemo } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { FileText, ExternalLink, X, Eye } from 'lucide-react';
import { aggregatePublicationReviewData } from '@/lib/label-aggregation';
import { getCategoryBackgroundColor, getStudyTagColor, getCategoryDescription, getStudyTagDescription } from '@/lib/classification-categories';
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

const ClaimPublicationsExpanded: React.FC<{
  publications: Publication[];
  links?: LinkRow[];
  isExpert: boolean;
  user: { id?: string; role?: string } | null;
  setReviewPublication: (p: { id: string; title: string; journal: string; publication_year: number; authors?: string; url?: string; existingReview?: PublicationScoreRow | null } | null) => void;
  getStanceIcon: (stance: Publication['stance']) => React.ReactNode;
  expertProfiles: Record<string, ExpertProfile>;
}> = ({ publications, links, isExpert, user, setReviewPublication, getStanceIcon, expertProfiles }) => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

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

  return (
    <CardContent className="pt-0">
      <div className="border-t border-border pt-2">
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
            return (
              <div key={pubIndex} className="bg-muted/20 rounded-md p-3">
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">
                        {pub.title}
                        {pub.rawScores && pub.rawScores.length > 0 && (
                          <button
                            onClick={() => setSelectedPublication(pub)}
                            title={`View ${pub.rawScores.length} expert review${pub.rawScores.length === 1 ? '' : 's'}`}
                            className="inline-flex items-center ml-2 text-muted-foreground hover:text-primary cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {pub.url && (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open paper in new tab"
                            className="inline-flex items-center ml-2 text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pub.authors} • {pub.journal} ({pub.year})
                        {pub.source && (
                          <>
                            {' • '}
                            <a
                              href={pub.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                              title="View source"
                            >
                              Source <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </p>
                      {/* Labels: inline on desktop, stacked on mobile */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-1.5">
                        {Object.entries(agg.classificationCounts).map(([label, count]) => (
                          <Popover key={label}>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-lg ${getCategoryBackgroundColor(label)} px-2 sm:px-3 py-1 text-xs font-semibold overflow-hidden cursor-pointer`}>
                                <span className="break-words">{label}</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({count})</span>
                              </div>
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
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('women_not_included')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Women Not Included</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.womenNotIncludedCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Women Not Included')}
                            </PopoverContent>
                          </Popover>
                        )}
                        {agg.observationalCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('observational')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Observational</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.observationalCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Observational')}
                            </PopoverContent>
                          </Popover>
                        )}
                        {agg.clinicalTrialCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('clinical trial')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Clinical Trial</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.clinicalTrialCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Clinical Trial')}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {pub.rawScores && pub.rawScores.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedPublication(pub)}
                        className="flex items-center gap-2 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View Reviews
                      </Button>
                    )}
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
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

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
    </CardContent>
  );
};

export default ClaimPublicationsExpanded;
