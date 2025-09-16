import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Loader2, Search, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DOIService } from '@/services/DOIService';

interface PaperSubmissionFormProps {
  claimId: string;
  claimTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  journal: string;
  publicationYear: string;
  doi: string;
  url: string;
  abstract: string;
  authors: string;
}

export const PaperSubmissionForm = ({ claimId, claimTitle, onSuccess, onCancel }: PaperSubmissionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingDOI, setFetchingDOI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    journal: '',
    publicationYear: '',
    doi: '',
    url: '',
    abstract: '',
    authors: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (fetchSuccess) setFetchSuccess(false);
  };

  const fetchFromDOI = async () => {
    if (!formData.doi.trim()) {
      setError('Please enter a DOI first');
      return;
    }

    setFetchingDOI(true);
    setError(null);
    setFetchSuccess(false);

    try {
      const publicationData = await DOIService.fetchPublicationData(formData.doi.trim());
      
      if (publicationData) {
        setFormData(prev => ({
          ...prev,
          title: publicationData.title || prev.title,
          journal: publicationData.journal || prev.journal,
          publicationYear: publicationData.year?.toString() || prev.publicationYear,
          url: publicationData.url || prev.url,
          abstract: publicationData.abstract || prev.abstract,
          authors: publicationData.authors?.join(', ') || prev.authors
        }));
        setFetchSuccess(true);
        toast.success('Paper information fetched successfully!');
      } else {
        setError('Could not fetch paper information from DOI. Please fill in the details manually.');
      }
    } catch (err) {
      console.error('Error fetching DOI data:', err);
      setError('Failed to fetch paper information. Please fill in the details manually.');
    } finally {
      setFetchingDOI(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.doi.trim()) return 'DOI is required';
    if (!formData.title.trim()) return 'Paper title is required';
    if (!formData.journal.trim()) return 'Journal name is required';
    
    const year = parseInt(formData.publicationYear);
    if (!formData.publicationYear || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return 'Please enter a valid publication year';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to submit papers');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('publications')
        .insert({
          claim_id: claimId,
          title: formData.title.trim(),
          journal: formData.journal.trim(),
          publication_year: parseInt(formData.publicationYear),
          doi: formData.doi.trim() || null,
          url: formData.url.trim() || null,
          abstract: formData.abstract.trim() || null,
          submitted_by: user.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Paper submitted successfully! It will be reviewed by experts before appearing on the claim.');
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting paper:', err);
      setError(err.message || 'Failed to submit paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">Submit Supporting Paper</CardTitle>
              <CardDescription className="text-sm">
                Enter the DOI to automatically fetch paper details for: <strong>"{claimTitle}"</strong>
              </CardDescription>
            </div>
          </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {fetchSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Paper information fetched successfully! You can review and edit the details below.
              </AlertDescription>
            </Alert>
          )}

          {/* DOI Input Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="doi">DOI (Digital Object Identifier) *</Label>
              <div className="flex gap-2">
                <Input
                  id="doi"
                  placeholder="e.g., 10.1038/nature12373 or https://doi.org/10.1038/nature12373"
                  value={formData.doi}
                  onChange={(e) => handleInputChange('doi', e.target.value)}
                  disabled={loading || fetchingDOI}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchFromDOI}
                  disabled={loading || fetchingDOI || !formData.doi.trim()}
                >
                  {fetchingDOI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {fetchingDOI ? 'Fetching...' : 'Fetch'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the DOI and click "Fetch" to automatically populate the paper details below.
              </p>
            </div>
          </div>

          {/* Paper Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="w-4 h-4" />
              <h3 className="font-medium">Paper Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Paper Title *</Label>
              <Input
                id="title"
                placeholder="Enter the full title of the research paper"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">Authors</Label>
              <Input
                id="authors"
                placeholder="e.g., Smith J, Johnson M, Brown K"
                value={formData.authors}
                onChange={(e) => handleInputChange('authors', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">Journal *</Label>
                <Input
                  id="journal"
                  placeholder="e.g., Nature Medicine"
                  value={formData.journal}
                  onChange={(e) => handleInputChange('journal', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Publication Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2024"
                  value={formData.publicationYear}
                  onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Direct URL (Optional)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/paper (if different from DOI link)"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract (Optional)</Label>
              <Textarea
                id="abstract"
                rows={4}
                placeholder="Paper abstract will be populated automatically, or you can paste it here..."
                value={formData.abstract}
                onChange={(e) => handleInputChange('abstract', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Submission Process:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your submission will be reviewed by experts or administrators</li>
                <li>Only approved papers will appear on the claim</li>
                <li>You'll be able to edit your submission while it's pending review</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Paper
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};