import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DOIService } from '@/services/DOIService';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().optional(),
  category: z.enum(['nutrition', 'fitness', 'mental_health', 'pregnancy', 'menopause', 'general_health', 'perimenopause']),
  sources: z.array(z.object({
    source_url: z.string().url('Please enter a valid URL'),
    source_type: z.string().optional(),
    source_title: z.string().optional(),
    source_description: z.string().optional(),
    author_name: z.string().optional(),
    published_date: z.string().optional(),
  })).optional(),
  publications: z.array(z.object({
    doi: z.string().refine((val) => {
      // If DOI field is empty, that's fine (user can remove the publication entry)
      if (!val || val.trim() === '') return true;
      
      // If DOI field has content, validate the format
      const doiPattern = /^10\.\d{4,}\/[^\s]+$/;
      const pubmedUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:pubmed\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov\/pubmed)\/\d+\/?/i;
      const pmidPattern = /^(?:pmid:?\s*)?\d+$/i;
      
      return doiPattern.test(val) || pubmedUrlPattern.test(val) || pmidPattern.test(val) || val.includes('doi.org');
    }, 'Please enter a valid DOI, PubMed URL, or PMID'),
    title: z.string().optional(),
    journal: z.string().optional(),
    publication_year: z.number().optional(),
    abstract: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClaimSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ClaimSubmissionForm = ({ onSuccess, onCancel }: ClaimSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDOI, setLoadingDOI] = useState<number | null>(null);
  const { user, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general_health',
      sources: [],
      publications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'publications',
  });

  const { fields: sourceFields, append: appendSource, remove: removeSource } = useFieldArray({
    control: form.control,
    name: 'sources',
  });

  const fetchPublicationData = async (doi: string, index: number) => {
    if (!doi) return;
    
    setLoadingDOI(index);
    try {
      const pubData = await DOIService.fetchPublicationData(doi);
      if (pubData) {
        form.setValue(`publications.${index}.title`, pubData.title || '');
        form.setValue(`publications.${index}.journal`, pubData.journal || '');
        form.setValue(`publications.${index}.publication_year`, pubData.year || new Date().getFullYear());
        form.setValue(`publications.${index}.abstract`, pubData.abstract || '');
        form.setValue(`publications.${index}.url`, pubData.url || `https://doi.org/${doi}`);
        
        toast.success("Publication Data Retrieved", {
          description: `Successfully fetched details for: ${pubData.title?.substring(0, 50)}...`,
        });
      }
    } catch (error) {
      console.error('Error fetching publication data:', error);
      toast.error("Publication Fetch Error", {
        description: "Could not retrieve publication data. Please enter details manually.",
      });
    } finally {
      setLoadingDOI(null);
    }
  };

  // Save only the provided URL into the form's source object. Do not fetch any metadata.
  const saveURLOnly = async (url: string, index: number) => {
    if (!url) return;

    try {
      // Ensure the field is set (the input is already controlled, but this guarantees the form value)
      form.setValue(`sources.${index}.source_url`, url);
      toast.success("URL Saved", {
        description: `Saved source URL.`,
      });
    } catch (error) {
      console.error('Error saving URL:', error);
      toast.error("Save Error", {
        description: "Could not save the URL. Please try again.",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please sign in to submit a claim.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting claim with data:', data);

      // Insert the claim
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
        })
        .select()
        .single();

      if (claimError) {
        console.error('Claim insert error:', claimError);
        throw claimError;
      }

      console.log('Claim inserted:', claimData);

      // Insert publications if any (filter out empty publications)
      if (data.publications && data.publications.length > 0) {
        const validPublications = data.publications.filter(pub => pub.doi && pub.doi.trim() !== '');
        
        if (validPublications.length > 0) {
          const publicationsToInsert = validPublications.map(pub => ({
            claim_id: claimData.id,
            title: pub.title || '',
            journal: pub.journal || '',
            publication_year: pub.publication_year || new Date().getFullYear(),
            doi: pub.doi,
            url: pub.url || `https://doi.org/${pub.doi}`,
            abstract: pub.abstract || '',
            submitted_by: user.id,
          }));

          console.log('Inserting publications:', publicationsToInsert);

          const { error: pubError } = await supabase
            .from('publications')
            .insert(publicationsToInsert);

          if (pubError) {
            console.error('Publications insert error:', pubError);
            throw pubError;
          }

          console.log('Publications inserted successfully');
        }
      }

      // Insert source links into `claim_links` table if any
      if (data.sources && data.sources.length > 0) {
        const linksToInsert = data.sources.map(source => ({
          claim_id: claimData.id,
          expert_user_id: user.id,
          link_type: source.source_type || 'webpage',
          url: source.source_url || null,
          title: source.source_title || null,
          description: source.source_description || null,
        }));

        console.log('Inserting claim_links:', linksToInsert);

        const { error: linksError } = await supabase
          .from('claim_links')
          .insert(linksToInsert);

        if (linksError) {
          console.error('claim_links insert error:', linksError);
          throw linksError;
        }

        console.log('claim_links inserted successfully');
      }

      toast.success("Claim Submitted Successfully", {
        description: "Your claim has been submitted for review.",
      });

      form.reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error submitting claim:', error);
      const message = error instanceof Error ? error.message : "Failed to submit claim. Please try again.";
      toast.error("Submission Error", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'menopause', label: 'Menopause' },
    { value: 'general_health', label: 'General Health' },
    { value: 'perimenopause', label: 'Perimenopause' },
  ];

  if (authLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-xs mx-auto">
        <Alert className="mb-3">
          <AlertCircle className="h-4 w-3" />
          <AlertDescription>
        You must be signed in to submit a claim. Please sign in and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit New Claim</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a clear, concise claim title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide detailed information about your claim"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Additional Sources</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSource({ source_url: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </div>

              {sourceFields.map((field, index) => {
                const source = form.watch(`sources.${index}`);
                return (
                  <Card key={field.id} className="p-4 bg-muted/20">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`sources.${index}.source_url`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Source URL</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    type="url"
                                    placeholder="https://..." 
                                    {...field}
                                    onBlur={() => form.trigger(`sources.${index}.source_url`)}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => saveURLOnly(field.value, index)}
                                  disabled={!field.value}
                                >
                                  Save
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-8"
                          onClick={() => removeSource(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {source?.source_title && (
                        <div className="space-y-2 p-3 bg-background rounded border">
                          <div>
                            <Badge variant="secondary" className="mb-2">Auto-filled</Badge>
                            <h4 className="font-medium text-sm">{source.source_title}</h4>
                          </div>
                          
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="text-base">Supporting Publications (Optional)</FormLabel>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add scientific publications that support your claim. You can also add these later.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ doi: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Publication
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                  <p className="text-sm">No publications added yet.</p>
                  <p className="text-xs mt-1">You can submit your claim without publications and add them later.</p>
                </div>
              )}

              {fields.map((field, index) => {
                const publication = form.watch(`publications.${index}`);
                return (
                  <Card key={field.id} className="p-4 bg-muted/20">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`publications.${index}.doi`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>DOI or PubMed Link</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="10.1000/xyz123 or https://pubmed.ncbi.nlm.nih.gov/12345678/" 
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => fetchPublicationData(field.value, index)}
                                  disabled={!field.value || loadingDOI === index}
                                >
                                  {loadingDOI === index ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Fetch'
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Supports DOI (10.1000/xyz123), PubMed URLs, or PMID numbers
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {publication?.title && (
                        <div className="space-y-2 p-3 bg-background rounded border">
                          <div>
                            <Badge variant="secondary" className="mb-2">Auto-filled</Badge>
                            <h4 className="font-medium text-sm">{publication.title}</h4>
                          </div>
                          {publication.journal && (
                            <p className="text-xs text-muted-foreground">
                              {publication.journal} • {publication.publication_year}
                            </p>
                          )}
                          {publication.abstract && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {publication.abstract}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="sm"
                className="w-32 text-sm px-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                  size="sm"
                  className="w-24 text-sm px-3"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};