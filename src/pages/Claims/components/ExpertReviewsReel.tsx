import { useRef, useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, HelpCircle, Info, Play, Pause } from 'lucide-react';
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
      <div className="flex-shrink-0 px-4 sm:px-6 pt-3 sm:pt-8 pb-2 sm:pb-6 border-b border-border/50">
        <h2 className="text-lg sm:text-2xl font-bold leading-tight mb-2 sm:mb-3 text-foreground break-words">
          {reviewCard.publication.title}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium">{reviewCard.publication.year}</span>
          {reviewCard.publication.journal && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{reviewCard.publication.journal}</span>
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
      </div>

      {/* Middle Section: Comments (Centered) */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-8 overflow-hidden">
        {reviewCard.expert.comments.length > 0 ? (
          <div className="w-full max-w-2xl space-y-3 sm:space-y-6">
            {reviewCard.expert.comments.map((comment, idx) => (
              <div
                key={idx}
                className="bg-muted/30 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-border/50 shadow-sm"
              >
                <div className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium tracking-wide uppercase">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm sm:text-lg leading-relaxed text-foreground font-normal">
                  <TranscriptText
                    text={comment.content}
                    wordsPerMinute={250}
                    isVisible={isVisible && idx === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground/60 text-base font-medium">
            No comments provided for this review.
          </div>
        )}
      </div>

      {/* Bottom Section: Labels, Tags, and Avatar */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-6 border-t border-border/50 bg-muted/20">
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* Labels and Tags Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            {/* Classification */}
            {reviewCard.expert.classification && (
              <div className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg ${getCategoryBackgroundColor(String(reviewCard.expert.classification))} px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold`}>
                <span>{String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}</span>
                {reviewCard.expert.reviewData && isProblematicCategory(String(reviewCard.expert.classification)) && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
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

// Component for transcript-style word highlighting
interface TranscriptTextProps {
  text: string;
  wordsPerMinute?: number; // Average reading speed (default: 200 WPM = ~300ms per word)
  isVisible?: boolean; // Whether the component is visible in viewport
}

const TranscriptText: React.FC<TranscriptTextProps> = ({
  text,
  wordsPerMinute = 300,
  isVisible = true
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  // Split text into words while preserving spaces - memoize to prevent recreation
  const words = useMemo(() => {
    return text.split(/(\s+)/).map((part, idx) => ({
      text: part,
      isSpace: /\s+/.test(part),
      index: idx
    }));
  }, [text]);

  // Calculate delay per word (average reading speed: 200-250 WPM)
  // 200 WPM = 200 words / 60 seconds = ~3.33 words/second = ~300ms per word
  const delayPerWord = useMemo(() => (60 / wordsPerMinute) * 1000, [wordsPerMinute]);

  // Get only non-space word indices for easier navigation
  const wordIndices = useMemo(() => {
    return words.map((w, i) => w.isSpace ? -1 : i).filter(i => i !== -1);
  }, [words]);

  // Pause when not visible
  useEffect(() => {
    if (!isVisible && isPlaying) {
      setIsPlaying(false);
    }
  }, [isVisible, isPlaying]);

  // Initialize to first word when starting to play
  useEffect(() => {
    if (isPlaying && currentWordIndex === -1 && wordIndices.length > 0) {
      setCurrentWordIndex(wordIndices[0]);
    }
  }, [isPlaying, currentWordIndex, wordIndices]);

  // Main interval effect for highlighting words
  // Restarts when delayPerWord changes to apply new speed
  useEffect(() => {
    if (!isPlaying || wordIndices.length === 0 || !isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval before creating a new one (important when delayPerWord changes)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initialize to first word if not started
    if (currentWordIndex === -1) {
      setCurrentWordIndex(wordIndices[0]);
      return;
    }

    // Create interval with current delayPerWord
    // This will restart with new delay when delayPerWord changes
    intervalRef.current = setInterval(() => {
      setCurrentWordIndex((prevIndex) => {
        const currentPos = wordIndices.indexOf(prevIndex);
        if (currentPos === -1 || currentPos >= wordIndices.length - 1) {
          // Finished reading
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsPlaying(false);
          return prevIndex;
        }
        return wordIndices[currentPos + 1];
      });
    }, delayPerWord);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, wordIndices, delayPerWord, isVisible, currentWordIndex]);

  // Reset when text changes
  useEffect(() => {
    setCurrentWordIndex(-1);
    setIsPlaying(false);
    hasStartedRef.current = false;
  }, [text]);

  // Scroll highlighted word into view smoothly
  useEffect(() => {
    if (currentWordIndex >= 0 && containerRef.current) {
      const wordElement = containerRef.current.querySelector(`[data-word-index="${currentWordIndex}"]`);
      if (wordElement) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          wordElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        });
      }
    }
  }, [currentWordIndex]);

  const handlePlay = () => {
    if (currentWordIndex === -1 || wordIndices.indexOf(currentWordIndex) >= wordIndices.length - 1) {
      // Start or restart from beginning
      setCurrentWordIndex(-1);
      setIsPlaying(true);
      hasStartedRef.current = true;
    } else {
      // Resume playing
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTextClick = () => {
    // Toggle play/pause when clicking on text
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  return (
    <div
      ref={containerRef}
      className="select-none"
    >
      {/* Text content */}
      <div
        className="cursor-pointer"
        onClick={handleTextClick}
        title={isPlaying ? "Click to pause" : "Click to play"}
      >
      {words.map((word, index) => {
        const isHighlighted = index === currentWordIndex;
        const isPast = index < currentWordIndex && !word.isSpace;

        if (word.isSpace) {
          return <span key={index}>{word.text}</span>;
        }

        return (
          <span
            key={index}
            data-word-index={index}
            className={`transition-colors duration-150 ${
              isHighlighted
                ? 'text-primary'
                : isPast
                ? 'text-foreground/90'
                : 'text-foreground/50'
            }`}
          >
            {word.text}
          </span>
        );
      })}
      </div>

      {/* Play/Pause Button - below text, aligned right */}
      <div className="flex justify-end mt-3">
        {!isPlaying || currentWordIndex === -1 ? (
          <button
            onClick={handlePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-md hover:scale-110 backdrop-blur-sm"
            aria-label="Play transcript"
            title="Start transcript animation"
          >
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-md hover:scale-110 backdrop-blur-sm"
            aria-label="Pause transcript"
            title="Pause transcript animation"
          >
            <Pause className="w-5 h-5" fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
};

const ExpertReviewsReel: React.FC<ExpertReviewsReelProps> = ({ reviewCards }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!reviewCards || reviewCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-base text-muted-foreground font-medium">
        No reviews yet for this claim.
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen sm:h-[95vh] sm:max-h-[800px] overflow-hidden">
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
        {reviewCards.map((reviewCard, index) => (
          <ReviewCard
            key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`}
            reviewCard={reviewCard}
            index={index}
            totalCards={reviewCards.length}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpertReviewsReel;
