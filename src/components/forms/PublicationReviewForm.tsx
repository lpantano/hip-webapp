import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calculateClaimStateLabel } from '@/lib/claim-state-calculator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, X, Check, ChevronsUpDown, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type ReviewCategory,
  type ReviewAnswer,
  type ReviewData,
  createEmptyReviewData,
  AGE_RANGES,
  ETHNICITY_OPTIONS
} from '@/types/review';
import { getCategoryBackgroundColor, getStudyTagColor, getStudyTagBorderColor, getQualityCheckDescription } from '@/lib/classification-categories';
import { CLASSIFICATION_CATEGORIES } from '@/lib/classification-categories';
import quality from '@/lib/quality-colors';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileKeyboardFix } from '@/hooks/useMobileKeyboardFix';

interface Publication {
  id: string;
  title: string;
  journal: string;
  publication_year: number;
  authors?: string;
  abstract?: string;
  doi?: string;
  url?: string;
}

interface PublicationReviewFormProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

interface ExistingReview {
  id: string;
  publication_id: string;
  expert_user_id: string;
  review_data: ReviewData | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

const REVIEW_CATEGORIES: ReviewCategory[] = [...CLASSIFICATION_CATEGORIES];

const PublicationReviewForm = ({ publication, isOpen, onClose, onReviewSubmitted }: PublicationReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewData, setReviewData] = useState<ReviewData>(createEmptyReviewData());
  const [comment, setComment] = useState('');
  const [customEthnicity, setCustomEthnicity] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [ethnicityOpen, setEthnicityOpen] = useState(false);
  const [ageRangeOpen, setAgeRangeOpen] = useState(false);
  const [studyTagsHelpOpen, setStudyTagsHelpOpen] = useState(false);

  // Mobile keyboard fix: scroll inputs into view when focused
  const isMobile = useIsMobile();
  const scrollContainerRef = useMobileKeyboardFix({
    enabled: false, // Disabled: full-screen layout and proper font sizes prevent zoom issues
    delay: 350,
    block: 'center'
  });

  // Fix for Radix Dialog scroll lock not being properly cleaned up
  // This ensures body scroll is restored when dialog closes
  const handleClose = useCallback(() => {
    onClose();
    // Force reset body scroll lock after dialog animation completes
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('data-scroll-locked');
    }, 300);
  }, [onClose]);

  // Fetch existing review for this publication by this expert
  const { data: existingReview } = useQuery({
    queryKey: ['publication-review', publication?.id, user?.id],
    queryFn: async () => {
      if (!publication?.id || !user?.id) return null;

      const { data, error } = await supabase
        .from('publication_scores')
        .select('*')
        .eq('publication_id', publication.id)
        .eq('expert_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    },
    enabled: !!publication?.id && !!user?.id && isOpen
  });

  // Load existing review data into form
  useEffect(() => {
    if (existingReview) {
      if (existingReview.review_data) {
        try {
          // Handle both cases: direct object or JSON string
          const reviewData = typeof existingReview.review_data === 'string'
            ? JSON.parse(existingReview.review_data)
            : existingReview.review_data;

          // Validate that the parsed data has the expected structure
          if (reviewData && typeof reviewData === 'object' && 'category' in reviewData) {
            // Ensure all fields exist for backwards compatibility
            const loadedData = reviewData as ReviewData;
            if (!loadedData.validation) {
              loadedData.validation = {
                hasConflictOfInterest: false,
                isReview: false,
                isCategoricalMetaAnalysis: false,
                overstatesEvidence: false,
                isValid: true
              };
            }
            // Ensure all validation fields exist for backwards compatibility
            const validationWithDefaults = {
              hasConflictOfInterest: loadedData.validation.hasConflictOfInterest || false,
              isReview: loadedData.validation.isReview || false,
              isCategoricalMetaAnalysis: loadedData.validation.isCategoricalMetaAnalysis || false,
              overstatesEvidence: (loadedData.validation as {overstatesEvidence?: boolean}).overstatesEvidence || false,
              isValid: true
            };

            if (!loadedData.systemUsed) {
              loadedData.systemUsed = {
                cells: false,
                animals: false,
                humans: false
              };
            }
            if (!loadedData.studySize) {
              loadedData.studySize = null;
            }
            if (typeof loadedData.womenNotIncluded === 'undefined') {
              loadedData.womenNotIncluded = false;
            }
            if (!loadedData.studyType) {
              loadedData.studyType = {
                observational: false,
                clinicalTrial: false
              };
            }

            // Recompute isValid based on validation fields
            validationWithDefaults.isValid = !(
              validationWithDefaults.hasConflictOfInterest ||
              validationWithDefaults.isReview ||
              validationWithDefaults.isCategoricalMetaAnalysis ||
              validationWithDefaults.overstatesEvidence
            );

            loadedData.validation = validationWithDefaults;

            // Recompute category based on decision tree
            loadedData.category = computeCategory(loadedData);

            setReviewData(loadedData);
          } else {
            setReviewData(createEmptyReviewData());
          }
        } catch (error) {
          console.error('Error parsing review data:', error);
          setReviewData(createEmptyReviewData());
        }
      } else {
        setReviewData(createEmptyReviewData());
      }
      setComment(existingReview.comments || '');
    } else {
      // Reset to empty when no existing review
      setReviewData(createEmptyReviewData());
      setComment('');
    }
  }, [existingReview]);

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // If publication overstates evidence (Misinformation), no further validation needed
    if (reviewData.validation.overstatesEvidence) {
      return errors; // Empty array - no validation errors for Misinformation
    }

    // If publication has other validation issues (Invalid), no further validation needed
    if (!reviewData.validation.isValid) {
      return errors; // Empty array - no validation errors for Invalid
    }

    // If any quality check is marked as "NO", system and study size are NOT required
    const qualityChecks = Object.values(reviewData.qualityChecks);
    const anyNo = qualityChecks.includes('NO');

    if (!anyNo) {
      // For valid publications, check system selection
      const hasSystemSelected = Object.values(reviewData.systemUsed).some(system => system);
      if (!hasSystemSelected) {
        errors.push('Please select one study system (cells, animals, or humans)');
      }

      // If humans are selected, study size should be selected
      if (reviewData.systemUsed.humans && !reviewData.studySize) {
        errors.push('Please select the study size for human studies');
      }
    }

    // If publication is valid and has human studies, quality checks are important
    if (reviewData.systemUsed.humans) {
      const allNA = qualityChecks.every(check => check === 'NA');
      if (allNA) {
        errors.push('Please answer at least one quality check question for human studies');
      }
    }

    return errors;
  };

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!publication?.id || !user?.id) throw new Error('Missing required data');

      // Validate form before submission
      const errors = validateForm();
      if (errors.length > 0) {
        setValidationErrors(errors);
        throw new Error('Please fix validation errors before submitting');
      }

      setValidationErrors([]); // Clear any previous errors

      const payload = {
        publication_id: publication.id,
        expert_user_id: user.id,
        review_data: JSON.parse(JSON.stringify(reviewData)), // Ensure proper JSON serialization
        comments: comment || null
      };

      const { error } = await supabase
        .from('publication_scores')
        .upsert(payload, { onConflict: 'publication_id,expert_user_id' });

      if (error) throw error;
    },
    onSuccess: async () => {
      const wasUpdate = !!existingReview;
      toast.success(wasUpdate ? 'Review updated' : 'Review submitted', {
        description: `Your publication review has been ${wasUpdate ? 'updated' : 'saved'} successfully.`
      });

      // Recalculate evidence status for the claim
      try {
        // First, get the claim_id from the publication
        const { data: pubData } = await supabase
          .from('publications')
          .select('claim_id')
          .eq('id', publication.id)
          .single();

        if (pubData?.claim_id) {
          // Fetch full claim data with publications and reviews
          const { data: claimData } = await supabase
            .from('claims')
            .select(`
              id,
              publications (
                id,
                stance,
                publication_scores (
                  review_data
                )
              )
            `)
            .eq('id', pubData.claim_id)
            .single();

          if (claimData) {
            // Transform data to match calculator interface
            type PublicationFromDB = {
              id: string;
              stance: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
              publication_scores: Array<{
                review_data: {
                  category?: string;
                  studyType?: {
                    observational?: boolean;
                    clinicalTrial?: boolean;
                  };
                  womenNotIncluded?: boolean;
                };
              }>;
            };

            const transformedClaimData = {
              id: claimData.id,
              publications: claimData.publications?.map((pub: PublicationFromDB) => ({
                id: pub.id,
                stance: pub.stance || undefined,
                rawScores: pub.publication_scores || []
              })) || []
            };

            const evidenceStatus = calculateClaimStateLabel(transformedClaimData);
            await supabase
              .from('claims')
              .update({ evidence_status: evidenceStatus })
              .eq('id', pubData.claim_id);
          }
        }
      } catch (statusError) {
        console.error('Failed to update evidence status:', statusError);
        // Don't fail the entire submission if status update fails
      }

      // Invalidate this form's own React Query cache immediately
      queryClient.invalidateQueries({ queryKey: ['publication-review', publication.id, user.id] });

      // Close the dialog using handleClose to ensure body scroll lock is reset
      handleClose();

      // Trigger parent refetch after dialog animation completes and scroll lock is reset
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
        }, 400);
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Error', {
        description: message || 'Failed to submit review. Please try again.'
      });
    }
  });

  const updateCategory = (category: ReviewCategory) => {
    // Categories are now automatically computed, manual changes not allowed
    return;
  };

  const updateSystemUsed = (system: keyof ReviewData['systemUsed'], value: boolean) => {
    setReviewData(prev => {
      // Reset all systems to false, then set the selected one to true (exclusive selection)
      const newSystemUsed = {
        cells: false,
        animals: false,
        humans: false,
        [system]: value
      };

      const newData = {
        ...prev,
        systemUsed: newSystemUsed
      };

      return {
        ...newData,
        category: computeCategory(newData)
      };
    });
  };

  const updateStudySize = (size: ReviewData['studySize']) => {
    setReviewData(prev => {
      const newData = {
        ...prev,
        studySize: size
      };
      return {
        ...newData,
        category: computeCategory(newData)
      };
    });
  };

  const updateWomenIncluded = (included: boolean) => {
    setReviewData(prev => {
      const newData = {
        ...prev,
        womenNotIncluded: included
      };
      return {
        ...newData,
        category: computeCategory(newData)
      };
    });
  };

  // Compute category based on decision tree
  const computeCategory = (data: ReviewData): ReviewCategory => {
    // 1. If claim overstates evidence, it's Misinformation (highest priority)
    if (data.validation.overstatesEvidence) {
      return 'Misinformation';
    }

    // 2. If any other validation issue, it's Invalid
    if (!data.validation.isValid) {
      return 'Invalid';
    }

    // 3. If any quality check is "NO", it's Inconclusive
    const hasNoQualityChecks = Object.values(data.qualityChecks).some(check => check === 'NO');
    if (hasNoQualityChecks) {
      return 'Inconclusive';
    }

    // 4. Check if any system is selected
    const hasSystemSelected = Object.values(data.systemUsed).some(system => system);
    if (!hasSystemSelected) {
      return null; // No category yet - nothing selected
    }

    // 5. If humans not selected in system used, it's Not Tested in Humans
    if (!data.systemUsed.humans) {
      return 'Not Tested in Humans';
    }

    // 6. Based on study size for human studies
    switch (data.studySize) {
      case 'less_than_100':
        return 'Limited Tested in Humans';
      case 'less_than_500k':
        return 'Tested in Humans';
      case 'more_than_500k':
        return 'Widely Tested in Humans';
      default:
        // If humans selected but no study size yet, default to Limited
        return 'Limited Tested in Humans';
    }
  };

  // Helper function to update validation and compute category
  const updateValidation = (field: keyof ReviewData['validation'], value: boolean) => {
    setReviewData(prev => {
      const newValidation = { ...prev.validation, [field]: value };
      const isValid = !(
        newValidation.hasConflictOfInterest ||
        newValidation.isReview ||
        newValidation.isCategoricalMetaAnalysis ||
        newValidation.overstatesEvidence
      );
      newValidation.isValid = isValid;

      const newData = {
        ...prev,
        validation: newValidation
      };

      return {
        ...newData,
        category: computeCategory(newData)
      };
    });
  };



  const toggleEthnicity = (ethnicity: string) => {
    setReviewData(prev => {
      const current = prev.tags.ethnicityLabels;
      const newLabels = current.includes(ethnicity)
        ? current.filter(e => e !== ethnicity)
        : [...current, ethnicity];
      return {
        ...prev,
        tags: { ...prev.tags, ethnicityLabels: newLabels }
      };
    });
  };

  const addCustomEthnicity = () => {
    if (customEthnicity.trim()) {
      toggleEthnicity(customEthnicity.trim());
      setCustomEthnicity('');
    }
  };

  const removeEthnicity = (ethnicity: string) => {
    setReviewData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        ethnicityLabels: prev.tags.ethnicityLabels.filter(e => e !== ethnicity)
      }
    }));
  };

  const toggleAgeRange = (range: string) => {
    setReviewData(prev => {
      const current = prev.tags.ageRanges;
      const newRanges = current.includes(range)
        ? current.filter(r => r !== range)
        : [...current, range];
      return {
        ...prev,
        tags: { ...prev.tags, ageRanges: newRanges }
      };
    });
  };

  const updateQualityCheck = (field: keyof ReviewData['qualityChecks'], value: ReviewAnswer) => {
    setReviewData(prev => {
      const newData = {
        ...prev,
        qualityChecks: {
          ...prev.qualityChecks,
          [field]: value
        }
      };
      return {
        ...newData,
        category: computeCategory(newData)
      };
    });
  };

  const getQualityColor = (value: ReviewAnswer) => quality.badge(value);

  if (!publication) return null;

  const isUpdate = !!existingReview;

  // Custom ethnicities (not in the predefined list)
  const customEthnicities = reviewData.tags.ethnicityLabels.filter(
    e => !ETHNICITY_OPTIONS.includes(e)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[100dvh] sm:w-[90vw] sm:h-auto max-h-[100dvh] sm:max-h-[95vh] !top-0 !left-0 !right-0 sm:!top-[50%] sm:!left-[50%] sm:!right-auto !translate-x-0 !translate-y-0 sm:!translate-x-[-50%] sm:!translate-y-[-50%] !rounded-none sm:!rounded-lg overflow-hidden flex flex-col p-3 sm:p-6 border-0 sm:border !m-0 !fixed">
        <DialogHeader className="flex-shrink-0 pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            {isUpdate ? 'Update Publication Review' : 'Review Publication'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Evaluate this research publication with comprehensive review criteria
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-auto">
          <ScrollArea className="h-full w-full pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-1">
              {/* Publication Info */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 flex flex-col gap-2">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-3 sm:line-clamp-2">{publication.title}</h3>
                <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2">
                  {publication.authors && <span className="line-clamp-1"><strong>Authors:</strong> {publication.authors}</span>}
                  <span><strong>Journal:</strong> {publication.journal} ({publication.publication_year})</span>
                  {publication.doi && <span className="break-all"><strong>DOI:</strong> {publication.doi}</span>}
                </div>
              </div>
              {/* Category Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <Label className="text-xs sm:text-sm font-semibold text-gray-800">Computed Category</Label>
                <div className="mt-2">
                  {reviewData.category ? (
                    <>
                      <Badge
                        className={`text-xs sm:text-sm ${getCategoryBackgroundColor(reviewData.category)}`}
                      >
                        {reviewData.category}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        Category automatically determined based on your responses above.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Category will be computed once you complete the validation and system selection.
                    </p>
                  )}
                </div>
              </div>
              {/* Validation Section */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm font-semibold">Publication Validation</Label>

                </div>
                <p className="text-xs">
                  Check if any apply. If so, publication will be marked as invalid for evidence assessment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="conflict-of-interest"
                      checked={reviewData.validation.hasConflictOfInterest}
                      onCheckedChange={(checked) => updateValidation('hasConflictOfInterest', checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="conflict-of-interest" className="text-xs font-medium cursor-pointer">
                        Conflict of Interest
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Company funding benefits from results
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="is-review"
                      checked={reviewData.validation.isReview}
                      onCheckedChange={(checked) => updateValidation('isReview', checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="is-review" className="text-xs font-medium cursor-pointer">
                        Review Study
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Review study (not original research)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="is-categorical-meta"
                      checked={reviewData.validation.isCategoricalMetaAnalysis}
                      onCheckedChange={(checked) => updateValidation('isCategoricalMetaAnalysis', checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="is-categorical-meta" className="text-xs font-medium cursor-pointer">
                        Categorical Meta-Analysis
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Categorical meta-analysis study
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="overstates-evidence"
                      checked={reviewData.validation.overstatesEvidence}
                      onCheckedChange={(checked) => updateValidation('overstatesEvidence', checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="overstates-evidence" className="text-xs font-medium cursor-pointer text-red-800">
                        Overstates Evidence
                      </Label>
                      <p className="text-xs mt-0.5">
                        Does the claim overstate or misinterpret the evidence?
                      </p>
                    </div>
                  </div>
                </div>

                {!reviewData.validation.isValid && (
                  <div className="bg-red-50 rounded p-2 mt-2">
                    <p className="text-xs font-medium">
                      ⚠️ This publication will be marked as invalid for evidence assessment
                    </p>
                  </div>
                )}
              </div>

              {/* Quality Checks Section - Only show if validation passed */}
              {reviewData.validation.isValid && (
                <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                  <Label className="text-xs sm:text-sm font-semibold">Quality Assessment</Label>
                  <p className="text-xs">
                    Evaluate the study design and methodology. Any "NO" will classify as "Inconclusive".
                  </p>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Study Design */}
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs font-medium text-gray-700">Study Design</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            {getQualityCheckDescription('studyDesign')}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(['PASS', 'NO', 'NA'] as ReviewAnswer[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateQualityCheck('studyDesign', option)}
                            className={`px-1 py-1 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm ${
                              reviewData.qualityChecks.studyDesign === option
                                ? quality.buttonActive(option)
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Representation was removed from the schema — UI intentionally omitted for current reviews. */}

                    {/* Control Group */}
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs font-medium text-gray-700">Control Group</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            {getQualityCheckDescription('controlGroup')}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(['PASS', 'NO', 'NA'] as ReviewAnswer[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateQualityCheck('controlGroup', option)}
                            className={`px-1 py-1 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm ${
                              reviewData.qualityChecks.controlGroup === option
                                ? quality.buttonActive(option)
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bias Addressed */}
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs font-medium text-gray-700">Bias Addressed</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            {getQualityCheckDescription('biasAddressed')}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(['PASS', 'NO', 'NA'] as ReviewAnswer[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateQualityCheck('biasAddressed', option)}
                            className={`px-1 py-1 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm ${
                              reviewData.qualityChecks.biasAddressed === option
                                ? quality.buttonActive(option)
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs font-medium text-gray-700">Statistics</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            {getQualityCheckDescription('statistics')}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(['PASS', 'NO', 'NA'] as ReviewAnswer[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateQualityCheck('statistics', option)}
                            className={`px-1 py-1 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm ${
                              reviewData.qualityChecks.statistics === option
                                ? quality.buttonActive(option)
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {Object.values(reviewData.qualityChecks).some(check => check === 'NO') && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                      <p className="text-xs text-red-700 font-medium">
                        ⚠️ This publication will be classified as "Inconclusive" due to quality issues
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* System Used Section and Study Size Section - Responsive flex layout */}
              {reviewData.validation.isValid && !Object.values(reviewData.qualityChecks).some(check => check === 'NO') && (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Study System Section */}
                  <div className="bg-slate-50 rounded-lg p-3 space-y-3 flex-1">
                    <Label className="text-sm font-semibold">Study System</Label>
                    <p className="text-xs">
                      Select the primary biological system used in this study (choose one).
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="system-cells"
                          name="studySystem"
                          checked={reviewData.systemUsed.cells}
                          onChange={() => updateSystemUsed('cells', true)}
                          className="text-xs"
                        />
                        <Label htmlFor="system-cells" className="text-xs font-medium cursor-pointer">
                          Cell Culture
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="system-animals"
                          name="studySystem"
                          checked={reviewData.systemUsed.animals}
                          onChange={() => updateSystemUsed('animals', true)}
                          className="text-xs"
                        />
                        <Label htmlFor="system-animals" className="text-xs font-medium cursor-pointer">
                          Animal Models
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="system-humans"
                          name="studySystem"
                          checked={reviewData.systemUsed.humans}
                          onChange={() => updateSystemUsed('humans', true)}
                          className="text-xs"
                        />
                        <Label htmlFor="system-humans" className="text-xs font-medium cursor-pointer">
                          Human Studies
                        </Label>
                      </div>
                    </div>
                    {!reviewData.systemUsed.humans && (reviewData.systemUsed.cells || reviewData.systemUsed.animals) && (
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <p className="text-xs text-orange-700">
                          Study will be categorized as "Not Tested in Humans"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Study Size Section - Only show if humans are selected */}
                  {reviewData.systemUsed.humans && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3 flex-1">
                      <Label className="text-sm font-semibold">Study Size (Human Participants)</Label>
                      <p className="text-xs">
                        Select the approximate number of human participants in this study.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="size-small"
                            name="studySize"
                            checked={reviewData.studySize === 'less_than_100'}
                            onChange={() => updateStudySize('less_than_100')}
                            className="text-xs"
                          />
                          <Label htmlFor="size-small" className="text-xs cursor-pointer">
                            Less than 100 participants
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="size-medium"
                            name="studySize"
                            checked={reviewData.studySize === 'less_than_500k'}
                            onChange={() => updateStudySize('less_than_500k')}
                            className="text-xs"
                          />
                          <Label htmlFor="size-medium" className="text-xs cursor-pointer">
                            100 to 500,000 participants
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="size-large"
                            name="studySize"
                            checked={reviewData.studySize === 'more_than_500k'}
                            onChange={() => updateStudySize('more_than_500k')}
                            className="text-xs"
                          />
                          <Label htmlFor="size-large" className="text-xs cursor-pointer">
                            More than 500,000 participants
                          </Label>
                        </div>
                      </div>

                      {/* Study Tags Section */}
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-xs font-semibold">Study Tags</Label>
                          <button
                            type="button"
                            onClick={() => setStudyTagsHelpOpen(true)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Help for study tags"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Women Not Included Chip */}
                          <button
                            type="button"
                            onClick={() => updateWomenIncluded(!reviewData.womenNotIncluded)}
                            className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm touch-manipulation ${
                              reviewData.womenNotIncluded
                                ? `${getStudyTagColor('women not included')} ${getStudyTagBorderColor('women not included')} shadow-sm`
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Women Not Included
                          </button>

                          {/* Observational Study Chip */}
                          <button
                            type="button"
                            onClick={() => setReviewData(prev => ({
                              ...prev,
                              studyType: {
                                observational: !prev.studyType.observational,
                                clinicalTrial: false // Turn off clinical trial when observational is selected
                              }
                            }))}
                            className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm touch-manipulation ${
                              reviewData.studyType.observational
                                ? `${getStudyTagColor('observational')} ${getStudyTagBorderColor('observational')} shadow-sm`
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Observational
                          </button>

                          {/* Clinical Trial Chip */}
                          <button
                            type="button"
                            onClick={() => setReviewData(prev => ({
                              ...prev,
                              studyType: {
                                observational: false, // Turn off observational when clinical trial is selected
                                clinicalTrial: !prev.studyType.clinicalTrial
                              }
                            }))}
                            className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full border-2 transition-all duration-200 hover:shadow-sm touch-manipulation ${
                              reviewData.studyType.clinicalTrial
                                ? `${getStudyTagColor('clinical trial')} ${getStudyTagBorderColor('clinical trial')} shadow-sm`
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Clinical Trial
                          </button>
                        </div>

                        {/* Study Tags Help Dialog */}
                        <Dialog open={studyTagsHelpOpen} onOpenChange={setStudyTagsHelpOpen}>
                          <DialogContent className="max-w-md w-[90vw] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-base">Study Tags Help</DialogTitle>
                              <DialogDescription className="text-xs sm:text-sm">
                                Explanation of the available study tags
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex gap-3">
                                <span className="text-2xl flex-shrink-0">♀</span>
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">Women Not Included</h4>
                                  <p className="text-sm text-gray-600">
                                    Select this tag if women or females were not included as participants in this study.
                                    This is important to track gender representation in research.
                                  </p>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex gap-3">
                                <span className="text-2xl flex-shrink-0">🔬</span>
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">Observational Study</h4>
                                  <p className="text-sm text-gray-600">
                                    Select this tag if the study is observational, meaning researchers observe participants
                                    without intervening or manipulating variables. Examples include cohort studies,
                                    case-control studies, and cross-sectional studies.
                                  </p>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex gap-3">
                                <span className="text-2xl flex-shrink-0">💊</span>
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">Clinical Trial</h4>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Select this tag if the study is a clinical trial, meaning it's an experimental study
                                    with active intervention or treatment. These studies test the effectiveness and safety
                                    of new treatments, drugs, or medical devices.
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                                <p className="text-xs text-blue-800">
                                  <strong>Note:</strong> Study type (Observational or Clinical Trial) is mutually exclusive -
                                  only one can be selected. However, "Women Not Included" can be combined with either study type.
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button onClick={() => setStudyTagsHelpOpen(false)} className="text-sm">
                                Got it
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* Evidence & Tags - Only show for valid human studies with good quality */}
              {(() => {
                const showEvidenceTags = reviewData.validation.isValid &&
                                       !Object.values(reviewData.qualityChecks).some(check => check === 'NO') &&
                                       reviewData.systemUsed.humans;

                if (!showEvidenceTags) return null;

                return (
                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base font-semibold">Evidence & Tags</Label>
                    <div className="space-y-3">
                    {/* Ethnicity & Age - Side by side dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Ethnicity/Population Dropdown */}
                      <div>
                        <TooltipProvider>
                          <div className="flex items-center gap-1 mb-1">
                            <Label className="text-xs font-medium">Ethnicity/Population</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-xs text-slate-600">
                                  ?
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Select from common options or use the "Custom..." text box to add something more specific like "Japanese" or "Abenaki"</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Popover open={ethnicityOpen} onOpenChange={setEthnicityOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between text-xs h-9 sm:h-8"
                            >
                              {reviewData.tags.ethnicityLabels.length > 0
                                ? `${reviewData.tags.ethnicityLabels.length} selected`
                                : "Select ethnicities..."
                              }
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] sm:w-60 p-0" align="start">
                            <Command shouldFilter={true}>
                              <CommandInput placeholder="Search ethnicities..." className="h-9 text-base sm:text-xs" />
                              <CommandList className="max-h-[200px] overflow-y-scroll">
                                <CommandEmpty>No ethnicity found.</CommandEmpty>
                                <CommandGroup>
                                  {ETHNICITY_OPTIONS.map((ethnicity) => (
                                    <CommandItem
                                      key={ethnicity}
                                      value={ethnicity}
                                      onSelect={() => toggleEthnicity(ethnicity)}
                                      className="text-xs"
                                    >
                                      <Check
                                        className={`mr-2 h-3 w-3 ${
                                          reviewData.tags.ethnicityLabels.includes(ethnicity)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      {ethnicity}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Custom ethnicity input */}
                        <div className="flex gap-1 mt-1">
                          <input
                            type="text"
                            placeholder="Custom..."
                            value={customEthnicity}
                            onChange={(e) => setCustomEthnicity(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEthnicity())}
                            className="flex-1 rounded border px-2 py-1 text-base sm:text-xs h-7"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addCustomEthnicity}
                            disabled={!customEthnicity.trim()}
                            className="text-xs px-2 py-1 h-7"
                          >
                            +
                          </Button>
                        </div>

                        {/* Selected badges */}
                        {reviewData.tags.ethnicityLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {reviewData.tags.ethnicityLabels.map(ethnicity => (
                              <Badge key={ethnicity} variant="default" className="text-xs gap-1 px-1">
                                {ethnicity}
                                <X className="w-2 h-2 cursor-pointer" onClick={() => removeEthnicity(ethnicity)} />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Age Ranges Dropdown */}
                      <div>
                        <Label className="text-xs font-medium mb-1 block">Age Ranges</Label>
                        <Popover open={ageRangeOpen} onOpenChange={setAgeRangeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between text-xs h-9 sm:h-8"
                            >
                              {reviewData.tags.ageRanges.length > 0
                                ? `${reviewData.tags.ageRanges.length} selected`
                                : "Select age ranges..."
                              }
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="start">
                            <Command shouldFilter={true}>
                              <CommandInput placeholder="Search ranges..." className="h-9 text-base sm:text-xs" />
                              <CommandList className="max-h-[240px] overflow-y-scroll">
                                <CommandEmpty>No age range found.</CommandEmpty>
                                <CommandGroup>
                                  {AGE_RANGES.map((range) => (
                                    <CommandItem
                                      key={range}
                                      value={range}
                                      onSelect={() => toggleAgeRange(range)}
                                      className="text-xs py-2.5"
                                    >
                                      <Check
                                        className={`mr-2 h-3 w-3 flex-shrink-0 ${
                                          reviewData.tags.ageRanges.includes(range)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      {range}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                      </Popover>

                      {/* Selected badges */}
                      {reviewData.tags.ageRanges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reviewData.tags.ageRanges.map(range => (
                            <Badge key={range} variant="default" className="text-xs gap-1 px-1">
                              {range}
                              <X className="w-2 h-2 cursor-pointer" onClick={() => {
                                setReviewData(prev => ({
                                  ...prev,
                                  tags: {
                                    ...prev.tags,
                                    ageRanges: prev.tags.ageRanges.filter(r => r !== range)
                                  }
                                }));
                              }} />
                            </Badge>
                          ))}
                        </div>
                      )}
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })()}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <div className="text-red-800 text-xs sm:text-sm font-medium mb-1">Please fix the following issues:</div>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments & Review Status */}
              <div className="space-y-2 mt-2">
                <Label className="text-xs sm:text-sm font-medium">Comments</Label>
                <p className="text-xs text-muted-foreground">
                  Use markdown for formatting: **bold**, [links](url), bullet points with -, etc.
                </p>
                <MarkdownEditor
                  value={comment}
                  onChange={setComment}
                  placeholder={`Additional notes or assessment...

**Bold text** for emphasis
- Bullet points for lists
[Link text](https://example.com) for links`}
                  height={150}
                  className="text-base sm:text-sm"
                />
                {existingReview && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span>Review exists (updated: {new Date(existingReview.updated_at).toLocaleDateString()})</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons - Fixed Footer */}
        <div className="flex gap-2 pt-3 sm:pt-4 border-t bg-background flex-shrink-0">
          <Button variant="outline" onClick={handleClose} className="px-3 sm:px-4 text-xs sm:text-sm flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button
            onClick={() => submitReviewMutation.mutate()}
            disabled={submitReviewMutation.isPending}
            className="px-4 sm:px-6 text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            {submitReviewMutation.isPending
              ? (isUpdate ? 'Updating...' : 'Submitting...')
              : (isUpdate ? 'Update' : 'Submit')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicationReviewForm;
