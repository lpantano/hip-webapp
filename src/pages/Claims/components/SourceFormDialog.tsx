import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeUrl } from '../utils/helpers';

interface SourceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  userId: string;
  onSuccess: () => void;
}

export const SourceFormDialog: React.FC<SourceFormDialogProps> = ({
  isOpen,
  onClose,
  claimId,
  userId,
  onSuccess
}) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [sourceType] = useState('webpage');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setSourceUrl('');
    setSourceTitle('');
    setSourceDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    const normalized = normalizeUrl(sourceUrl);
    if (!normalized) {
      toast.error('Invalid URL', { description: 'Please enter a valid URL before saving.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        claim_id: claimId,
        expert_user_id: userId,
        title: sourceTitle || null,
        url: normalized,
        description: sourceDescription || null,
        link_type: sourceType || 'webpage'
      };

      const { error } = await supabase.from('claim_links').insert(payload);
      if (error) throw error;

      toast.success('Source added', { description: 'Your source was added successfully.' });
      onSuccess();
      handleClose();
    } catch (e: unknown) {
      console.error('Error adding source link:', e);
      const message = e instanceof Error ? e.message : 'Failed to add source.';
      toast.error('Add Source Failed', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>Add Source to claim</DialogTitle>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">URL</label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title (optional)</label>
            <Input
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="Optional title"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description (optional)</label>
            <Textarea
              value={sourceDescription}
              onChange={(e) => setSourceDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!sourceUrl || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Source'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
