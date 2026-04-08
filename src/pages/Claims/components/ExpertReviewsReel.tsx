import { useRef, useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, HelpCircle, Info, CalendarDays } from 'lucide-react';
import { getCategoryBackgroundColor, getStudyTagDescription, getQualityCheckDescription, getStudyTagColor } from '@/lib/classification-categories';
import { isProblematicCategory } from '@/lib/classification-categories';
import { getClassificationReasons } from '@/types/review';
import quality from '@/lib/quality-colors';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

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
    stance?: 'supporting' | 'contradicting' | null;
    reviewedAt?: string | null;
  };
};

interface ExpertReviewsReelProps {
  reviewCards: ExpertReviewCard[];
  onClose?: () => void;
}

// Individual Review Card Component
interface ReviewCardProps {
  reviewCard: ExpertReviewCard;
  index: number;
  totalCards: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ reviewCard, index, totalCards }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(index === 0);

  const tags = reviewCard.expert.tags || null;
  // derive study-level tags from reviewData when available
  const studyTags: string[] = [];
  const rd = reviewCard.expert.reviewData;
  if (rd) {
    if (rd.womenNotIncluded) studyTags.push('Women Not Included');
    if (rd.studyType?.observational) studyTags.push('Observational');
    if (rd.studyType?.clinicalTrial) studyTags.push('Clinical Trial');
  }

  const noScores = reviewCard.expert.scores.filter(s => s.score === 'NO');

  // Use IntersectionObserver to detect when card is visible
  useEffect(() => {
    // For the first card, set visible immediately
    if (index === 0) {
      setIsVisible(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setIsVisible(true);
          } else if (!entry.isIntersecting) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: [0, 0.3, 0.5, 1],
        rootMargin: '0px'
      }
    );

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="snap-start snap-always h-screen sm:h-[95vh] sm:max-h-[800px] flex flex-col bg-background border-b border-border"
    >
      {/* Top Section: Publication Title */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-6 sm:pt-4 pb-2 sm:pb-3 border-b border-border/50">
        <h2 className="text-lg sm:text-lg font-bold leading-tight mb-2 text-foreground break-words">
          {reviewCard.publication.title}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{reviewCard.publication.year}</span>
            {reviewCard.publication.journal && (
              <>
                {/* <span className="text-muted-foreground/50">•</span> */}
                {/* <span>{reviewCard.publication.journal}</span> */}
              </>
            )}
            {reviewCard.publication.source && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <a
                  href={reviewCard.publication.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  title="View source"
                >
                  Source
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
          {/* Stance Chip */}
          {reviewCard.expert.stance && (
            <div className={`inline-flex items-center rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold flex-shrink-0 ${
              reviewCard.expert.stance === 'supporting'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {reviewCard.expert.stance === 'supporting' ? 'Reported to Support' : 'Reported to Disprove'}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Labels, Tags, and Comments (Scrollable) */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-2 sm:py-4 overflow-y-auto">
        {/* Labels and Tags Row - Moved from bottom */}
        <div className="mb-4 pb-4 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            {/* Classification */}
            {reviewCard.expert.classification && (
              <>
                <div className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg ${getCategoryBackgroundColor(String(reviewCard.expert.classification))} px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold`}>
                  <span>{String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}</span>
                  {reviewCard.expert.reviewData && isProblematicCategory(String(reviewCard.expert.classification)) && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center text-gray-500 hover:text-gray-650 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                          aria-label="Classification reasons"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-sm p-3">
                        {(() => {
                          const reasons = getClassificationReasons(reviewCard.expert.reviewData);
                          if (reasons.length > 0) {
                            return (
                              <div className="text-sm text-muted-foreground space-y-2">
                                {reasons.map((reason, i) => (
                                  <div key={i} className="leading-relaxed">{reason}</div>
                                ))}
                              </div>
                            );
                          }
                          return <div className="text-sm text-muted-foreground">No reasons provided.</div>;
                        })()}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Invalid/Inconclusive/Misinformation Reason Chips */}
                {reviewCard.expert.reviewData && isProblematicCategory(String(reviewCard.expert.classification)) && (() => {
                  const reasons = getClassificationReasons(reviewCard.expert.reviewData);
                  return reasons.map((reason, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {reason}
                    </div>
                  ));
                })()}
              </>
            )}

            {/* Study Tags */}
            {studyTags.length > 0 && studyTags.map((tag, i) => (
              <Popover key={i}>
                <PopoverTrigger asChild>
                  <div className={`cursor-pointer inline-flex items-center rounded-lg ${getStudyTagColor(tag)} px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-opacity hover:opacity-80`}>
                    {tag}
                  </div>
                </PopoverTrigger>
                <PopoverContent side="top" className="max-w-xs text-sm p-3">
                  <div className="leading-relaxed">{getStudyTagDescription(tag)}</div>
                </PopoverContent>
              </Popover>
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
                <div key={idx} className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg ${scoreItem.score ? quality.badge(scoreItem.score) : ''} px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold`}>
                  <span className="font-semibold">{label}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        aria-label={`Help for ${label}`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="max-w-xs text-sm p-3">
                      <div className="leading-relaxed">
                        {"This didn't pass: " + getQualityCheckDescription(scoreItem.category)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}

            {/* Ethnicity Labels */}
            {tags && Array.isArray(tags.ethnicityLabels) && tags.ethnicityLabels.length > 0 && tags.ethnicityLabels.map((eth: string, i: number) => (
              <div key={i} className="inline-flex items-center rounded-lg border border-border px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-foreground bg-background/50">
                {eth}
              </div>
            ))}

            {/* Age Ranges */}
            {tags && Array.isArray(tags.ageRanges) && tags.ageRanges.length > 0 && tags.ageRanges.map((age: string, i: number) => (
              <div key={i} className="inline-flex items-center rounded-lg border border-border px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-foreground bg-background/50">
                {age}
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        {reviewCard.expert.comments.length > 0 ? (
          <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4">
            {reviewCard.expert.comments.map((comment, idx) => (
              <div
                key={idx}
                className="bg-muted/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm"
              >
                <div className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <MarkdownRenderer
                  content={comment.content}
                  className="text-base sm:text-base leading-relaxed"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center text-muted-foreground/60 text-base font-medium">
            No comments provided for this review.
          </div>
        )}
      </div>

      {/* Bottom Section: Avatar Only */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-5 sm:py-4 border-t border-border/50 bg-muted/20">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Avatar and Expert Name Row */}
          <div className="flex items-center gap-3 pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer group" role="button" tabIndex={0}>
                  {reviewCard.expert.avatar_url ? (
                    <img
                      src={reviewCard.expert.avatar_url}
                      alt={reviewCard.expert.display_name || 'Expert'}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-border group-hover:ring-primary/50 transition-all"
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
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-base font-semibold flex items-center justify-center ring-2 ring-border group-hover:ring-primary/50 transition-all"
                    style={{ display: reviewCard.expert.avatar_url ? 'none' : 'flex' }}
                  >
                    {(reviewCard.expert.display_name || 'E').split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {reviewCard.expert.display_name || 'Expert Reviewer'}
                    </div>
                    <div className="text-xs text-muted-foreground">Expert Review</div>
                    {reviewCard.expert.reviewedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        <span>Reviewed {new Date(reviewCard.expert.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent side="top" className="max-w-xs text-sm p-3">
                <div className="font-semibold">{reviewCard.expert.display_name || 'Expert'}</div>
                <div className="text-xs text-muted-foreground mt-1">Review #{index + 1} of {totalCards}</div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

// TranscriptText component removed - feature to be added later

const ExpertReviewsReel: React.FC<ExpertReviewsReelProps> = ({ reviewCards, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Sort review cards: Supporting first, then Contradicting, then null stance
  const sortedReviewCards = (reviewCards || []).length > 0 ? [...reviewCards].sort((a, b) => {
    const stanceOrder = { supporting: 0, contradicting: 1, null: 2 };
    const aStance = a.expert.stance || null;
    const bStance = b.expert.stance || null;
    return stanceOrder[aStance as keyof typeof stanceOrder] - stanceOrder[bStance as keyof typeof stanceOrder];
  }) : [];

  // Hide scroll indicator when user scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedReviewCards.length <= 1) return;

    const handleScroll = () => {
      // Hide indicator after scrolling past 10% of viewport height
      if (container.scrollTop > window.innerHeight * 0.1) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [sortedReviewCards.length]);

  if (!reviewCards || reviewCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-base text-muted-foreground font-medium">
        No reviews yet for this claim.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[700px] mx-auto h-screen sm:h-[95vh] sm:max-h-[800px] overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
        }}
        role="list"
        aria-label="Expert reviews"
      >
        {sortedReviewCards.map((reviewCard, index) => (
          <ReviewCard
            key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`}
            reviewCard={reviewCard}
            index={index}
            totalCards={reviewCards.length}
          />
        ))}

        {/* End card with close button */}
        {onClose && (
          <div className="snap-start snap-always h-screen sm:h-[95vh] sm:max-h-[800px] flex flex-col items-center justify-center bg-background border-t border-border">
            <div className="text-center px-6 max-w-md space-y-6">
              <div className="text-xl font-semibold text-foreground">
                You've reached the end
              </div>
              <div className="text-base text-muted-foreground">
                You've viewed all {sortedReviewCards.length} expert review{sortedReviewCards.length === 1 ? '' : 's'} for this claim.
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
              >
                Close Reviews
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && sortedReviewCards.length > 1 && (
        <div className="absolute bottom-6 right-6 pointer-events-none animate-fade-in z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground  flex items-center gap-2">
            <span>↓ Scroll for more reviews</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertReviewsReel;
