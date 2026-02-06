import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EVIDENCE_STATUS_OPTIONS } from '../constants';

interface EvidenceStatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export const EvidenceStatusFilter = ({
  selectedStatuses,
  onStatusChange
}: EvidenceStatusFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (status: string) => {
    const isSelected = selectedStatuses.includes(status);

    if (isSelected) {
      // Prevent deselecting all - must have at least one selected
      if (selectedStatuses.length > 1) {
        onStatusChange(selectedStatuses.filter(s => s !== status));
      }
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleSelectAll = () => {
    onStatusChange([...EVIDENCE_STATUS_OPTIONS]);
  };

  const handleClearAll = () => {
    // Keep at least one selected (default to first option)
    onStatusChange([EVIDENCE_STATUS_OPTIONS[0]]);
  };

  const getDisplayText = () => {
    if (selectedStatuses.length === EVIDENCE_STATUS_OPTIONS.length) {
      return 'All Evidence Status';
    }
    if (selectedStatuses.length === 1) {
      return selectedStatuses[0];
    }
    return `${selectedStatuses.length} Selected`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[200px] h-9 justify-between"
          aria-label="Filter by evidence status"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{getDisplayText()}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Evidence Status
        </div>
        <DropdownMenuSeparator />
        {EVIDENCE_STATUS_OPTIONS.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={selectedStatuses.includes(status)}
            onCheckedChange={() => handleToggle(status)}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            <span className="flex-1">{status}</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex gap-2 px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex-1 h-7 text-xs"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="flex-1 h-7 text-xs"
            disabled={selectedStatuses.length === 1}
          >
            Clear
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
