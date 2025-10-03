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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DOIService } from '@/services/DOIService';
import { URLMetadataService } from '@/services/URLMetadataService';

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
    doi: z.string().min(1, 'DOI is required'),
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
  const [loadingURL, setLoadingURL] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general_health',
      sources: [],
      publications: [{ doi: '' }],
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
        
        toast({
          title: "Publication Data Retrieved",
          description: `Successfully fetched details for: ${pubData.title?.substring(0, 50)}...`,
        });
      }
    } catch (error) {
      console.error('Error fetching DOI data:', error);
      toast({
        title: "DOI Fetch Error",
        description: "Could not retrieve publication data. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingDOI(null);
    }
  };

  const fetchURLMetadata = async (url: string, index: number) => {
    if (!url) return;
    
    setLoadingURL(index);
    try {
      const metadata = await URLMetadataService.fetchMetadata(url);
      if (metadata) {
        if (metadata.title) form.setValue(`sources.${index}.source_title`, metadata.title);
        if (metadata.description) form.setValue(`sources.${index}.source_description`, metadata.description);
        if (metadata.author) form.setValue(`sources.${index}.author_name`, metadata.author);
        if (metadata.publishedDate) form.setValue(`sources.${index}.published_date`, metadata.publishedDate);
        if (metadata.sourceType) form.setValue(`sources.${index}.source_type`, metadata.sourceType);
        
        toast({
          title: "Source Data Retrieved",
          description: `Successfully fetched details for: ${metadata.title?.substring(0, 50)}...`,
        });
      }
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      toast({
        title: "URL Fetch Error",
        description: "Could not retrieve source data. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingURL(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a claim.",
        variant: "destructive",
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

      // Insert sources if any
      if (data.sources && data.sources.length > 0) {
        const sourcesToInsert = data.sources.map(source => ({
          claim_id: claimData.id,
          user_id: user.id,
          source_type: (source.source_type || 'webpage') as 'webpage' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'reddit' | 'podcast' | 'book' | 'research_paper' | 'other',
          source_url: source.source_url || null,
          source_title: source.source_title || null,
          source_description: source.source_description || null,
          author_name: source.author_name || null,
          published_date: source.published_date || null,
        }));

        console.log('Inserting sources:', sourcesToInsert);

        const { error: sourcesError } = await supabase
          .from('sources')
          .insert(sourcesToInsert);

        if (sourcesError) {
          console.error('Sources insert error:', sourcesError);
          throw sourcesError;
        }

        console.log('Sources inserted successfully');
      }

      toast({
        title: "Claim Submitted Successfully",
        description: "Your claim has been submitted for review.",
      });

      form.reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error submitting claim:', error);
      const message = error instanceof Error ? error.message : "Failed to submit claim. Please try again.";
      toast({
        title: "Submission Error",
        description: message,
        variant: "destructive",
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
                                    placeholder="https://..." 
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => fetchURLMetadata(field.value, index)}
                                  disabled={!field.value || loadingURL === index}
                                >
                                  {loadingURL === index ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Fetch'
                                  )}
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
                          {source.source_type && (
                            <p className="text-xs text-muted-foreground">
                              Type: {source.source_type.charAt(0).toUpperCase() + source.source_type.slice(1)}
                            </p>
                          )}
                          {source.author_name && (
                            <p className="text-xs text-muted-foreground">
                              Author: {source.author_name}
                            </p>
                          )}
                          {source.published_date && (
                            <p className="text-xs text-muted-foreground">
                              Published: {source.published_date}
                            </p>
                          )}
                          {source.source_description && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {source.source_description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Supporting Publications</FormLabel>
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
                              <FormLabel>DOI</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="10.1000/xyz123" 
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