import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  type ReviewCategory, 
  type ReviewAnswer, 
  type ReviewData,
  createEmptyReviewData,
  AGE_RANGES,
  ETHNICITY_OPTIONS
} from '@/types/review';

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

const REVIEW_CATEGORIES: ReviewCategory[] = [
  'Unreliable',
  'Not Tested in Humans',
  'Limited Tested in Humans',
  'Tested in Humans',
  'Widely Tested in Humans'
];

const PublicationReviewForm = ({ publication, isOpen, onClose, onReviewSubmitted }: PublicationReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reviewData, setReviewData] = useState<ReviewData>(createEmptyReviewData());
  const [comment, setComment] = useState('');
  const [customEthnicity, setCustomEthnicity] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
            setReviewData(reviewData as ReviewData);
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
    
    // Check if evidence category is selected
    if (!reviewData.category) {
      errors.push('Please select an evidence category');
    }
    
    // Check if at least one quality check is answered (not all NA)
    const qualityChecks = Object.values(reviewData.qualityChecks);
    const allNA = qualityChecks.every(check => check === 'NA');
    if (allNA) {
      errors.push('Please answer at least one quality check question');
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
    onSuccess: () => {
      const wasUpdate = !!existingReview;
      toast({
        title: wasUpdate ? 'Review updated' : 'Review submitted',
        description: `Your publication review has been ${wasUpdate ? 'updated' : 'saved'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['publication-review'] });
      queryClient.invalidateQueries({ queryKey: ['publication-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      onReviewSubmitted?.();
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Error',
        description: message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const updateCategory = (category: ReviewCategory) => {
    setReviewData(prev => ({ ...prev, category }));
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
    setReviewData(prev => ({
      ...prev,
      qualityChecks: {
        ...prev.qualityChecks,
        [field]: value
      }
    }));
  };

  const getQualityColor = (value: ReviewAnswer) => {
    switch (value) {
      case 'PASS':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'NO':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'NA':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!publication) return null;

  const isUpdate = !!existingReview;

  // Custom ethnicities (not in the predefined list)
  const customEthnicities = reviewData.tags.ethnicityLabels.filter(
    e => !ETHNICITY_OPTIONS.includes(e)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[65vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isUpdate ? 'Update Publication Review' : 'Review Publication'}
          </DialogTitle>
          <DialogDescription>
            Evaluate this research publication with comprehensive review criteria
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[65vh] pr-2">
            <div className="space-y-3 pb-2">
              {/* Publication Info */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col gap-1">
                <h3 className="font-semibold text-base line-clamp-2">{publication.title}</h3>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                  {publication.authors && <span className="truncate"><strong>Authors:</strong> {publication.authors}</span>}
                  <span><strong>Journal:</strong> {publication.journal} ({publication.publication_year})</span>
                  {publication.doi && <span><strong>DOI:</strong> {publication.doi}</span>}
                </div>
              </div>

              {/* Main Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-3">
                {/* Quality Checks */}
                <div className="space-y-2 py-4">
                  <Label className="text-base font-semibold">Quality Checks</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Study Design */}
                    <div className="border rounded-lg p-2 flex items-center gap-2">
                      <Label className="text-xs font-medium min-w-[90px]">Study Design</Label>
                      <RadioGroup value={reviewData.qualityChecks.studyDesign} onValueChange={(val) => updateQualityCheck('studyDesign', val as ReviewAnswer)} className="flex gap-2">
                        <RadioGroupItem value="PASS" id="design-pass" />
                        <Label htmlFor="design-pass" className={`text-xs px-2 py-1 rounded ${getQualityColor('PASS')}`}>PASS</Label>
                        <RadioGroupItem value="NO" id="design-no" />
                        <Label htmlFor="design-no" className={`text-xs px-2 py-1 rounded ${getQualityColor('NO')}`}>NO</Label>
                        <RadioGroupItem value="NA" id="design-na" />
                        <Label htmlFor="design-na" className={`text-xs px-2 py-1 rounded ${getQualityColor('NA')}`}>NA</Label>
                      </RadioGroup>
                    </div>
                    {/* Representation */}
                    <div className="border rounded-lg p-2 flex items-center gap-2">
                      <Label className="text-xs font-medium min-w-[90px]">Representation</Label>
                      <RadioGroup value={reviewData.qualityChecks.representation} onValueChange={(val) => updateQualityCheck('representation', val as ReviewAnswer)} className="flex gap-2">
                        <RadioGroupItem value="PASS" id="rep-pass" />
                        <Label htmlFor="rep-pass" className={`text-xs px-2 py-1 rounded ${getQualityColor('PASS')}`}>PASS</Label>
                        <RadioGroupItem value="NO" id="rep-no" />
                        <Label htmlFor="rep-no" className={`text-xs px-2 py-1 rounded ${getQualityColor('NO')}`}>NO</Label>
                        <RadioGroupItem value="NA" id="rep-na" />
                        <Label htmlFor="rep-na" className={`text-xs px-2 py-1 rounded ${getQualityColor('NA')}`}>NA</Label>
                      </RadioGroup>
                    </div>
                    {/* Control Group */}
                    <div className="border rounded-lg p-2 flex items-center gap-2">
                      <Label className="text-xs font-medium min-w-[90px]">Control Group</Label>
                      <RadioGroup value={reviewData.qualityChecks.controlGroup} onValueChange={(val) => updateQualityCheck('controlGroup', val as ReviewAnswer)} className="flex gap-2">
                        <RadioGroupItem value="PASS" id="control-pass" />
                        <Label htmlFor="control-pass" className={`text-xs px-2 py-1 rounded ${getQualityColor('PASS')}`}>PASS</Label>
                        <RadioGroupItem value="NO" id="control-no" />
                        <Label htmlFor="control-no" className={`text-xs px-2 py-1 rounded ${getQualityColor('NO')}`}>NO</Label>
                        <RadioGroupItem value="NA" id="control-na" />
                        <Label htmlFor="control-na" className={`text-xs px-2 py-1 rounded ${getQualityColor('NA')}`}>NA</Label>
                      </RadioGroup>
                    </div>
                    {/* Bias Addressed */}
                    <div className="border rounded-lg p-2 flex items-center gap-2">
                      <Label className="text-xs font-medium min-w-[90px]">Bias Addressed</Label>
                      <RadioGroup value={reviewData.qualityChecks.biasAddressed} onValueChange={(val) => updateQualityCheck('biasAddressed', val as ReviewAnswer)} className="flex gap-2">
                        <RadioGroupItem value="PASS" id="bias-pass" />
                        <Label htmlFor="bias-pass" className={`text-xs px-2 py-1 rounded ${getQualityColor('PASS')}`}>PASS</Label>
                        <RadioGroupItem value="NO" id="bias-no" />
                        <Label htmlFor="bias-no" className={`text-xs px-2 py-1 rounded ${getQualityColor('NO')}`}>NO</Label>
                        <RadioGroupItem value="NA" id="bias-na" />
                        <Label htmlFor="bias-na" className={`text-xs px-2 py-1 rounded ${getQualityColor('NA')}`}>NA</Label>
                      </RadioGroup>
                    </div>
                    {/* Statistics */}
                    <div className="border rounded-lg p-2 flex items-center gap-2">
                      <Label className="text-xs font-medium min-w-[90px]">Statistics</Label>
                      <RadioGroup value={reviewData.qualityChecks.statistics} onValueChange={(val) => updateQualityCheck('statistics', val as ReviewAnswer)} className="flex gap-2">
                        <RadioGroupItem value="PASS" id="stats-pass" />
                        <Label htmlFor="stats-pass" className={`text-xs px-2 py-1 rounded ${getQualityColor('PASS')}`}>PASS</Label>
                        <RadioGroupItem value="NO" id="stats-no" />
                        <Label htmlFor="stats-no" className={`text-xs px-2 py-1 rounded ${getQualityColor('NO')}`}>NO</Label>
                        <RadioGroupItem value="NA" id="stats-na" />
                        <Label htmlFor="stats-na" className={`text-xs px-2 py-1 rounded ${getQualityColor('NA')}`}>NA</Label>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Evidence Category & Tags */}
                <div className="space-y-2 py-4">
                  <Label className="text-base font-semibold">Evidence & Tags</Label>
                  <div className="space-y-2">
                    <div>
                      <Select value={reviewData.category} onValueChange={(val) => updateCategory(val as ReviewCategory)}>
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {REVIEW_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Ethnicity/Population */}
                  <div>
                    <Label className="text-xs font-medium">Ethnicity/Population</Label>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {ETHNICITY_OPTIONS.slice(0, 6).map(ethnicity => (
                        <label key={ethnicity} className="flex items-center space-x-1 cursor-pointer">
                          <Checkbox checked={reviewData.tags.ethnicityLabels.includes(ethnicity)} onCheckedChange={() => toggleEthnicity(ethnicity)} className="h-3 w-3" />
                          <span className="text-xs truncate">{ethnicity}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <input type="text" placeholder="Custom..." value={customEthnicity} onChange={(e) => setCustomEthnicity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEthnicity())} className="flex-1 rounded border px-2 py-1 text-xs" />
                      <Button size="sm" variant="outline" onClick={addCustomEthnicity} disabled={!customEthnicity.trim()} className="text-xs px-2 py-1 h-7">+</Button>
                    </div>
                    {customEthnicities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customEthnicities.map(ethnicity => (
                          <Badge key={ethnicity} variant="secondary" className="text-xs gap-1 px-1">
                            {ethnicity}
                            <X className="w-2 h-2 cursor-pointer" onClick={() => removeEthnicity(ethnicity)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Age Ranges - new row below ethnicity */}
                  <div className="mt-2">
                    <Label className="text-xs font-medium">Age Ranges (decades)</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {AGE_RANGES.map(range => (
                        <label key={range} className="flex items-center space-x-1 cursor-pointer">
                          <Checkbox checked={reviewData.tags.ageRanges.includes(range)} onCheckedChange={() => toggleAgeRange(range)} className="h-3 w-3" />
                          <span className="text-xs">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <div className="text-red-800 text-sm font-medium mb-1">Please fix the following issues:</div>
                  <ul className="text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments & Review Status */}
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium">Comments</Label>
                <Textarea placeholder="Additional notes or assessment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="text-sm" />
                {existingReview && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-700 dark:text-blue-300 mt-1">
                    <User className="w-3 h-3 inline mr-1" />
                    Review exists (updated: {new Date(existingReview.updated_at).toLocaleDateString()})
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button 
            onClick={() => submitReviewMutation.mutate()}
            disabled={submitReviewMutation.isPending}
            className="px-6"
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
