import { useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, HelpCircle, Info } from 'lucide-react';
import { getCategoryBackgroundColor, getStudyTagDescription, getQualityCheckDescription, getStudyTagColor } from '@/lib/classification-categories';
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
        className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] p-0 w-full"
        role="list"
        aria-label="Expert reviews"
      >
        {reviewCards.map((reviewCard) => {
          const tags = reviewCard.expert.tags || null;
          // derive study-level tags from reviewData when available
          const studyTags: string[] = [];
          const rd = reviewCard.expert.reviewData;
          if (rd) {
            if (rd.womenNotIncluded) studyTags.push('Women Not Included');
            if (rd.studyType?.observational) studyTags.push('Observational');
            if (rd.studyType?.clinicalTrial) studyTags.push('Clinical Trial');
          }

          return (
            <div
              key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`}
              className="bg-background border border-border rounded-lg p-1 sm:p-1 shadow-sm w-full"
            >
              {/* Top row: Publication info + Avatar (avatar moved to the right) */}

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-12 cursor-pointer" role="button" tabIndex={0}>
                      {reviewCard.expert.avatar_url ? (
                        <img
                          src={reviewCard.expert.avatar_url}
                          alt={reviewCard.expert.display_name || 'Expert'}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
                        {(reviewCard.expert.display_name || 'E').split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-xs text-sm p-2">
                    <div className="font-semibold">{reviewCard.expert.display_name || 'Expert'}</div>
                  </PopoverContent>
                </Popover>
                <div className="flex-1 w-full">
                  <h4 className="font-semibold text-sm mb-1 sm:mr-4 break-words">
                    {reviewCard.publication.title}
                  </h4>
                  <p className="text-xs text-muted-foreground break-words">
                    ({reviewCard.publication.year})
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
                </div>


              </div>
              {/* Bottom row: Review content (top: tags + quality checks; second row: labels/categories) */}
              <div className="mt-1">
                <div className="ml-1">
                {(() => {
                  const noScores = reviewCard.expert.scores.filter(s => s.score === 'NO');

                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Classification */}
                      {reviewCard.expert.classification && (
                        <div className={`inline-flex items-center gap-2 rounded-lg ${getCategoryBackgroundColor(String(reviewCard.expert.classification))} px-2 py-1 text-xs font-semibold`}>
                          <span>{String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}</span>

                          {/* Put the Info trigger inside the badge so the icon is visually inside it */}
                          {reviewCard.expert.reviewData && isProblematicCategory(String(reviewCard.expert.classification)) && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                  aria-label="Classification reasons"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="max-w-xs text-xs p-2">
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
                                  return <div className="text-xs text-muted-foreground">No reasons provided.</div>;
                                })()}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}

                      {/* Study Tags */}
                      {studyTags.length > 0 && studyTags.map((tag, i) => (
                        <Popover key={i}>
                          <PopoverTrigger asChild>
                            <div className={`cursor-pointer inline-flex items-center rounded-lg ${getStudyTagColor(tag)} px-2 py-1 text-xs font-semibold`}>
                              {tag}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            {getStudyTagDescription(tag)}
                          </PopoverContent>
                        </Popover>
                      ))}

                      {/* Ethnicity Labels */}
                      {tags && Array.isArray(tags.ethnicityLabels) && tags.ethnicityLabels.length > 0 && tags.ethnicityLabels.map((eth: string, i: number) => (
                        <div key={i} className="inline-flex items-center rounded-lg border border-border px-2 py-1 text-xs font-semibold text-foreground">{eth}</div>
                      ))}

                      {/* Age Ranges */}
                      {tags && Array.isArray(tags.ageRanges) && tags.ageRanges.length > 0 && tags.ageRanges.map((age: string, i: number) => (
                        <div key={i} className="inline-flex items-center rounded-lg border border-border px-2 py-1 text-xs font-semibold text-foreground">{age}</div>
                      ))}

                      {/* Study Quality Checks */}
                      {noScores.length > 0 && noScores.map((scoreItem, idx) => {
                        const studycheck: Record<string, string> = {
                          studyDesign: 'Study Design',
                          controlGroup: 'Control Group',
                          biasAddressed: 'Bias Addressed',
                          statistics: 'Statistics'
                        };
                        const label = studycheck[scoreItem.category] || scoreItem.category;

                        return (
                          <div key={idx} className={`inline-flex items-center gap-2 rounded-lg ${scoreItem.score ? quality.badge(scoreItem.score) : ''} px-2 py-1 text-xs font-semibold`}>
                            <span className="font-medium">{label}</span>

                            {/* Info popover trigger inside the badge */}
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
                                {"This didn't pass: " + getQualityCheckDescription(scoreItem.category)}
                              </PopoverContent>
                            </Popover>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                </div>



                {reviewCard.expert.comments.length > 0 && (
                  <div>
                    <div className="space-y-2 mt-2">
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
