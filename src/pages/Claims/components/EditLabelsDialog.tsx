import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { CLAIM_LABEL_GROUPS } from '@/constants/labels';
import { cn } from '@/lib/utils';

interface EditLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLabels: string[];
  onSave: (labels: string[]) => Promise<void>;
  isSaving: boolean;
}

export const EditLabelsDialog = ({
  open,
  onOpenChange,
  currentLabels,
  onSave,
  isSaving,
}: EditLabelsDialogProps) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(currentLabels);

  useEffect(() => {
    if (open) {
      setSelectedLabels(currentLabels);
    }
  }, [open, currentLabels]);

  const toggleLabel = (value: string) => {
    setSelectedLabels((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Topic Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {CLAIM_LABEL_GROUPS.map((group) => (
            <Collapsible key={group.id} defaultOpen={group.labels.some((l) => selectedLabels.includes(l.value))}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm">{group.name}</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 [.data-[state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="flex flex-wrap gap-2 px-2">
                  {group.labels.map((label) => {
                    const isSelected = selectedLabels.includes(label.value);
                    return (
                      <Badge
                        key={label.value}
                        variant="outline"
                        className={cn(
                          'cursor-pointer transition-all hover:scale-105',
                          isSelected ? group.color.selected : group.color.unselected
                        )}
                        onClick={() => toggleLabel(label.value)}
                      >
                        {label.label}
                      </Badge>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(selectedLabels)} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Labels'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
