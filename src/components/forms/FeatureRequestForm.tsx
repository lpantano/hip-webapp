import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const LABEL_OPTIONS = [
  // development-focused
  'ui',
  'accessibility',
  'performance',
  'api',
  'analytics',
  'integration',
  'bug',
  // content/review-focused
  'content',
  'research',
  'review',
  'documentation'
];

const FeatureRequestForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      toast({ title: 'Sign in required', description: 'You must be signed in to submit a feature request.', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Validation', description: 'Please provide a short title for the request.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feature_requests').insert([{
        title: title.trim(),
        description: description.trim() || null,
        labels: selectedLabels.length ? selectedLabels : null,
        user_id: user.id,
        status: 'pending', // default
        priority: 'low' // default priority, admin can change later
      }]);

      if (error) throw error;

      toast({ title: 'Request submitted', description: 'Your feature request was created.' });
      setTitle('');
      setDescription('');
      setSelectedLabels([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to submit feature request', err);
      toast({ title: 'Error', description: 'Failed to submit request. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title of the feature" />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the feature and why it's useful" />
      </div>

      <div>
        <Label>Labels</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {LABEL_OPTIONS.map((label) => (
            <label key={label} className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selectedLabels.includes(label)} onCheckedChange={() => toggleLabel(label)} />
              <span className="capitalize">{label.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">Pick one or more labels to help categorise the request. Admins can later update status and priority.</div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" type="button" onClick={() => { if (onCancel) onCancel(); }}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
      </div>
    </form>
  );
};

export default FeatureRequestForm;
