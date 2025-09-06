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
import { Star, FileText, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

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
}

interface ReviewCategory {
  key: string;
  label: string;
  description: string;
}

const reviewCategories: ReviewCategory[] = [
  {
    key: 'study_size',
    label: 'Sample Size Analysis',
    description: 'We examine study participant numbers across multiple research papers, ensuring adequate statistical power for reliable conclusions about women\'s health conditions.'
  },
  {
    key: 'population',
    label: 'Population Diversity',
    description: 'Assessment of demographic representation including age groups, ethnicities, and geographic locations to ensure findings apply broadly to women\'s experiences.'
  },
  {
    key: 'consensus',
    label: 'Research Consensus',
    description: 'Review of agreement across multiple independent studies and meta-analyses to identify consistent patterns in health condition research.'
  },
  {
    key: 'interpretation',
    label: 'Clinical Application',
    description: 'Validation of how research findings translate to real-world treatment outcomes and patient experiences in clinical settings.'
  }
];

const scoreLabels = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

interface ExistingReview {
  id?: string;
  publication_id?: string;
  expert_user_id?: string;
  category: Database['public']['Enums']['evidence_score_category'];
  score: number;
  notes?: string | null;
}

const PublicationReviewForm = ({ publication, isOpen, onClose }: PublicationReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [scores, setScores] = useState<Record<string, { score: number; notes: string }>>({});

  // Fetch existing reviews for this publication by this expert
  const { data: existingReviews } = useQuery<ExistingReview[]>({
    queryKey: ['publication-reviews', publication?.id, user?.id],
    queryFn: async () => {
      if (!publication?.id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('publication_scores')
        .select('*')
        .eq('publication_id', publication.id)
        .eq('expert_user_id', user.id);
      
      if (error) throw error;
      return (data || []) as ExistingReview[];
    },
    enabled: !!publication?.id && !!user?.id && isOpen
  });

  // Set form values when existing reviews load
  useEffect(() => {
    if (existingReviews && existingReviews.length > 0) {
      const reviewMap: Record<string, { score: number; notes: string }> = {};
      existingReviews.forEach(review => {
        reviewMap[review.category] = {
          score: review.score,
          notes: review.notes || ''
        };
      });
      setScores(reviewMap);
    } else {
      // Reset form for new reviews
      const emptyScores: Record<string, { score: number; notes: string }> = {};
      reviewCategories.forEach(cat => {
        emptyScores[cat.key] = { score: 0, notes: '' };
      });
      setScores(emptyScores);
    }
  }, [existingReviews]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!publication?.id || !user?.id) throw new Error('Missing required data');
      
      // Prepare reviews for submission
      const reviews = Object.entries(scores).filter(([_, data]) => data.score > 0).map(([category, data]) => ({
        publication_id: publication.id,
        expert_user_id: user.id,
        category: category as Database['public']['Enums']['evidence_score_category'],
        score: data.score,
        notes: data.notes || null
      }));

      if (reviews.length === 0) {
        throw new Error('Please provide at least one score');
      }

      // Use upsert to atomically insert or update existing rows and avoid unique-constraint 409 errors
      const { error } = await supabase
        .from('publication_scores')
        .upsert(reviews, { onConflict: 'publication_id,expert_user_id,category' });

      if (error) throw error;
    },
    onSuccess: () => {
      const wasUpdate = existingReviews && existingReviews.length > 0;
      toast({
        title: wasUpdate ? "Review updated" : "Review submitted",
        description: `Your publication review has been ${wasUpdate ? 'updated' : 'saved'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['publication-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error",
        description: message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateScore = (category: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        score
      }
    }));
  };

  const updateNotes = (category: string, notes: string) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        notes
      }
    }));
  };

  if (!publication) return null;

  const isUpdate = (existingReviews && existingReviews.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isUpdate ? 'Update Publication Review' : 'Review Publication'}
          </DialogTitle>
          <DialogDescription>
            Provide expert scores for different aspects of this research publication
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Publication Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{publication.title}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {publication.authors && <p><strong>Authors:</strong> {publication.authors}</p>}
                <p><strong>Journal:</strong> {publication.journal} ({publication.publication_year})</p>
                {publication.doi && <p><strong>DOI:</strong> {publication.doi}</p>}
              </div>
            </div>
            
            {publication.abstract && (
              <div>
                <Label className="text-sm font-medium">Abstract</Label>
                <ScrollArea className="h-32 w-full rounded border p-2 text-sm">
                  {publication.abstract}
                </ScrollArea>
              </div>
            )}

            {/* Existing Reviews Count */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{existingReviews?.length || 0} categories reviewed by you</span>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="space-y-4">
            <ScrollArea className="h-96 w-full">
              <div className="space-y-6 pr-4">
                {reviewCategories.map((category) => (
                  <div key={category.key} className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{category.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 w-8"
                          onClick={() => updateScore(category.key, star)}
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              scores[category.key]?.score >= star 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      ))}
                      {scores[category.key]?.score > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {scoreLabels[scores[category.key].score as keyof typeof scoreLabels]}
                        </Badge>
                      )}
                    </div>

                    {/* Notes */}
                    <Textarea
                      placeholder={`Notes on ${category.label.toLowerCase()}...`}
                      value={scores[category.key]?.notes || ''}
                      onChange={(e) => updateNotes(category.key, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    
                    {category.key !== reviewCategories[reviewCategories.length - 1].key && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? (isUpdate ? 'Updating...' : 'Submitting...') : (isUpdate ? 'Update Review' : 'Submit Review')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicationReviewForm;
