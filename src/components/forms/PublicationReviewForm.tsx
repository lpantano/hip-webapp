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
import { FileText, User, Link as LinkIcon } from 'lucide-react';
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
  onReviewSubmitted?: () => void;
}

interface ScoreCategory {
  key: string;        // UI key
  label: string;
  description?: string;
  dbKey: Database['public']['Enums']['evidence_score_category']; // maps to DB enum
}

const scoreCategories: ScoreCategory[] = [
  {
    key: 'alignment',
    label: 'Alignment of Claim with Evidence',
    description: 'How well does the paper support or contradict the claim being evaluated?',
    dbKey: 'interpretation'
  },
  {
    key: 'study_size',
    label: 'Study Size',
    description: 'Assess adequacy of sample size for reliable conclusions',
    dbKey: 'study_size'
  },
  {
    key: 'population',
    label: 'Population Representation',
    description: 'Diversity and representativeness of participants related to the claim',
    dbKey: 'population'
  },
  {
    key: 'data_analysis',
    label: 'Data Analysis Method',
    description: 'Appropriateness and rigor of statistical or analysis methods',
    dbKey: 'consensus'
  }
];

const scoreLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};

interface ExistingReview {
  id?: string;
  publication_id?: string;
  expert_user_id?: string;
  category: Database['public']['Enums']['evidence_score_category'];
  score: number;
  notes?: string | null;
}

const PublicationReviewForm = ({ publication, isOpen, onClose, onReviewSubmitted }: PublicationReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Scores keyed by UI key, notes removed per-category in favor of a single comment box
  const [scores, setScores] = useState<Record<string, { score: number }>>({});

  // Single comment for the whole review
  const [comment, setComment] = useState('');

  // Evidence classification (only one may be selected)
  const [classification, setClassification] = useState<
    'early' | 'preliminary' | 'strong' | 'established' | null
  >(null);

  // Multiple links input
  const [links, setLinks] = useState<string[]>(['']);

  // Fetch existing review (single row) for this publication by this expert
  const { data: existingReview } = useQuery<{
    id?: string;
    publication_id?: string;
    expert_user_id?: string;
    evidence_classification?: 'early' | 'preliminary' | 'strong' | 'established' | null;
    alignment?: number | null;
    study_size?: number | null;
    population?: number | null;
    consensus?: number | null;
    comments?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null>({
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

  // Set form values when existing review loads
  useEffect(() => {
    const initial: Record<string, { score: number }> = {};
    scoreCategories.forEach(cat => {
      initial[cat.key] = { score: 0 };
    });

    if (existingReview) {
      // map consolidated columns into UI keys
      if (typeof existingReview.alignment === 'number') initial['alignment'] = { score: existingReview.alignment };
      if (typeof existingReview.study_size === 'number') initial['study_size'] = { score: existingReview.study_size };
      if (typeof existingReview.population === 'number') initial['population'] = { score: existingReview.population };
      // UI key `data_analysis` maps to DB column `consensus`
      if (typeof existingReview.consensus === 'number') initial['data_analysis'] = { score: existingReview.consensus };

      if (existingReview.comments) setComment(existingReview.comments || '');
      // safe assignment for classification without using `any`
      setClassification(existingReview.evidence_classification ?? null);
    }

    setScores(initial);
  }, [existingReview]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!publication?.id || !user?.id) throw new Error('Missing required data');

      // Build consolidated payload matching new table schema
      const payload = {
        publication_id: publication.id,
        expert_user_id: user.id,
        evidence_classification: classification || null,
        alignment: scores['alignment']?.score ?? null,
        study_size: scores['study_size']?.score ?? null,
        population: scores['population']?.score ?? null,
        consensus: scores['data_analysis']?.score ?? null,
        comments: comment || null
      } as const;

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

  const updateScore = (category: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        score
      }
    }));
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addLink = () => setLinks(prev => [...prev, '']);
  const removeLink = (index: number) => setLinks(prev => prev.filter((_, i) => i !== index));

  if (!publication) return null;

  const isUpdate = !!existingReview;

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
          {/* Publication Info + Classification + Alignment Score (LEFT) */}
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

            {/* Evidence Classification (moved to left column) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Evidence Classification (pick one)</Label>
              <p className="text-xs text-muted-foreground">Select the best single classification for the evidence presented in this paper.</p>
              <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="classification" checked={classification === 'early'} onChange={() => setClassification('early')} />
                  <span className="text-sm ml-2">Early Evidence (cells and/or animals)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="classification" checked={classification === 'preliminary'} onChange={() => setClassification('preliminary')} />
                  <span className="text-sm ml-2">Preliminary Human Evidence (small / early trials)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="classification" checked={classification === 'strong'} onChange={() => setClassification('strong')} />
                  <span className="text-sm ml-2">Strong Human Evidence (controlled trials)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="classification" checked={classification === 'established'} onChange={() => setClassification('established')} />
                  <span className="text-sm ml-2">Established Consensus (repeated + reviewed)</span>
                </label>
              </div>
            </div>

            {/* Alignment Score (moved to left column) */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">{scoreCategories.find(sc => sc.key === 'alignment')?.label}</Label>
                {scoreCategories.find(sc => sc.key === 'alignment')?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{scoreCategories.find(sc => sc.key === 'alignment')?.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((score) => (
                  <Button
                    key={score}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => updateScore('alignment', score)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full transition-colors ${
                        scores['alignment']?.score >= score 
                          ? 'bg-primary' 
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </Button>
                ))}
                {scores['alignment']?.score > 0 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {scoreLabels[scores['alignment'].score as keyof typeof scoreLabels]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Existing Reviews Count */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{existingReview ? 'You have submitted a review' : 'You have not reviewed this publication'}</span>
              </div>
            </div>
          </div>

          {/* Review Form (RIGHT) - other scores, comment, links */}
          <div className="space-y-4">
            <ScrollArea className="h-96 w-full">
              <div className="space-y-6 pr-4">

                {/* Score Categories (excluding alignment which is on the left) */}
                {scoreCategories.filter(c => c.key !== 'alignment').map((category) => (
                  <div key={category.key} className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{category.label}</Label>
                      {category.description && <p className="text-xs text-muted-foreground mt-1">{category.description}</p>}
                    </div>

                    {/* Dot Rating */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((score) => (
                        <Button
                          key={score}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 w-8"
                          onClick={() => updateScore(category.key, score)}
                        >
                          <div 
                            className={`w-3 h-3 rounded-full transition-colors ${
                              scores[category.key]?.score >= score 
                                ? 'bg-primary' 
                                : 'bg-muted-foreground/30'
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

                    {category.key !== scoreCategories[scoreCategories.length - 1].key && (
                      <Separator />
                    )}
                  </div>
                ))}

                <Separator />

                {/* Single Comment Box */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reviewer Comment</Label>
                  <Textarea
                    placeholder={`Overall notes, interpretation, or context...`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* Links
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Related Links</Label>
                  <p className="text-xs text-muted-foreground">Add zero or more links to supplementary sources, platforms, or webpages.</p>
                  <div className="flex flex-col gap-2 mt-2">
                    {links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        <input
                          className="flex-1 rounded border px-2 py-1 text-sm"
                          placeholder="https://..."
                          value={link}
                          onChange={(e) => updateLink(idx, e.target.value)}
                        />
                        {links.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeLink(idx)}>Remove</Button>
                        )}
                      </div>
                    ))}
                    <div>
                      <Button variant="outline" size="sm" onClick={addLink}>Add link</Button>
                    </div>
                  </div>
                </div> */}

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
