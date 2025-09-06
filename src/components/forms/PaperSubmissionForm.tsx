import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
}

export const PaperSubmissionForm = ({ claimId, claimTitle, onSuccess, onCancel }: PaperSubmissionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    journal: '',
    publicationYear: '',
    doi: '',
    url: '',
    abstract: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Paper title is required';
    if (!formData.journal.trim()) return 'Journal name is required';
    
    const year = parseInt(formData.publicationYear);
    if (!formData.publicationYear || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return 'Please enter a valid publication year';
    }
    
    if (!formData.doi.trim() && !formData.url.trim()) {
      return 'Please provide either a DOI or URL to access the paper';
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
              Add a scientific publication that supports or relates to: <strong>"{claimTitle}"</strong>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1000/182"
                value={formData.doi}
                onChange={(e) => handleInputChange('doi', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/paper"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract (Optional)</Label>
            <Textarea
              id="abstract"
              rows={4}
              placeholder="Paste the paper's abstract here..."
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              disabled={loading}
            />
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