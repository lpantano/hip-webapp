import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, HelpCircle } from 'lucide-react';
import { getCategoryBackgroundColor, getStudyTagDescription, getQualityCheckDescription } from '@/lib/classification-categories';
import { isProblematicCategory } from '@/lib/classification-categories';
import { getClassificationReasons } from '@/types/review';
import quality from '@/lib/quality-colors';

export type ExpertReviewCard = {
  publication: {
    id: string;
    title: string;
    journal: string;
    year: number;
    authors: string;
    source?: string | null;
  };
  expert: {
    expert_user_id: string;
    display_name?: string | null;
    avatar_url?: string | null;
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

interface ExpertReviewsReelProps {
  reviewCards: ExpertReviewCard[];
}

const ExpertReviewsReel: React.FC<ExpertReviewsReelProps> = ({ reviewCards }) => {
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
          const tags = reviewCard.expert.tags || null;

          return (
            <div
              key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`}
              className="bg-background border border-border rounded-lg p-3 sm:p-4 shadow-sm"
            >
              {/* Top row: Avatar + Publication info */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3">
                <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-24">
                  {reviewCard.expert.avatar_url ? (
                    <img
                      src={reviewCard.expert.avatar_url}
                      alt={reviewCard.expert.display_name || 'Expert'}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
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
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-sm flex items-center justify-center"
                    style={{ display: reviewCard.expert.avatar_url ? 'none' : 'flex' }}
                  >
                    {(reviewCard.expert.display_name || 'E').split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="font-semibold text-sm text-center sm:text-center flex-1 sm:flex-none">
                    {reviewCard.expert.display_name || 'Expert'}
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <h4 className="font-semibold text-sm mb-1 break-words">
                    {reviewCard.publication.title}
                  </h4>
                  <p className="text-xs text-muted-foreground break-words">
                    {reviewCard.publication.authors} • {reviewCard.publication.journal} ({reviewCard.publication.year})
                    {reviewCard.publication.source && (
                      <>
                        {' • '}
                        <a
                          href={reviewCard.publication.source}
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
                  <br />

                  {reviewCard.expert.classification && (
                    <div className="flex items-start gap-3 mb-2">
                      <Badge className={`text-xs ${getCategoryBackgroundColor(String(reviewCard.expert.classification))} pointer-events-none transition-none`}>
                        {String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}
                      </Badge>

                      {reviewCard.expert.reviewData && isProblematicCategory(String(reviewCard.expert.classification)) && (
                        <div className="flex-1">
                          {(() => {
                            const reasons = getClassificationReasons(reviewCard.expert.reviewData);
                            if (reasons.length > 0) {
                              return (
                                <div className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                  {reasons.map((reason, i) => (
                                    <div key={i}>{reason}</div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {tags && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(tags.ethnicityLabels) && tags.ethnicityLabels.length > 0 && (
                        <span className="text-xs flex flex-wrap items-center gap-1">
                          <span className="font-medium">Ethnicities:</span>
                          {tags.ethnicityLabels.map((eth: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{eth}</Badge>
                          ))}
                        </span>
                      )}
                      {Array.isArray(tags.ageRanges) && tags.ageRanges.length > 0 && (
                        <span className="text-xs flex flex-wrap items-center gap-1">
                          <span className="font-medium">Ages:</span>
                          {tags.ageRanges.map((age: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{age}</Badge>
                          ))}
                        </span>
                      )}
                    </div>
                  )}

                  {reviewCard.expert.womenNotIncluded && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="mb-2 cursor-pointer">
                          <Badge className="text-xs bg-red-100 text-red-800">
                            ♀ Women Not Included
                          </Badge>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        {getStudyTagDescription('women_not_included')}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {/* Bottom row: Review content (scores, comments) */}
              <div className="mt-2">
                {(() => {
                  // Only show NO scores if any exist
                  const noScores = reviewCard.expert.scores.filter(s => s.score === 'NO');

                  return noScores.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-row flex-wrap gap-3 sm:gap-4 items-center">
                        {noScores.map((scoreItem, idx) => {
                          const humanLabels: Record<string, string> = {
                            studyDesign: 'Study Design',
                            controlGroup: 'Control Group',
                            biasAddressed: 'Bias Addressed',
                            statistics: 'Statistics'
                          };
                          const label = humanLabels[scoreItem.category] || scoreItem.category;

                          return (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-muted-foreground">{label}:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                    aria-label={`Help for ${label}`}
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                  {getQualityCheckDescription(scoreItem.category)}
                                </PopoverContent>
                              </Popover>
                              <Badge className={`text-xs px-2 py-0.5 ${scoreItem.score ? quality.badge(scoreItem.score) : ''}`}>
                                {scoreItem.score ?? 'No score'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {reviewCard.expert.comments.length > 0 && (
                  <div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertReviewsReel;
