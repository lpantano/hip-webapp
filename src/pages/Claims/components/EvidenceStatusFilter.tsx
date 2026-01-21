import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { getEvidenceStatusColor } from '../utils/helpers';
import { EVIDENCE_STATUS_OPTIONS } from '../constants';
import { cn } from '@/lib/utils';

interface EvidenceStatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export const EvidenceStatusFilter = ({
  selectedStatuses,
  onStatusChange
}: EvidenceStatusFilterProps) => {

  const handleChange = (statuses: string[]) => {
    // Prevent empty selection - auto-select all if user tries to deselect everything
    if (statuses.length === 0) {
      onStatusChange([...EVIDENCE_STATUS_OPTIONS]);
    } else {
      onStatusChange(statuses);
    }
  };

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
        Filter by Evidence Status
      </div>
      <ToggleGroup
        type="multiple"
        value={selectedStatuses}
        onValueChange={handleChange}
        className="flex flex-wrap gap-2 justify-center"
      >
        {EVIDENCE_STATUS_OPTIONS.map((status) => {
          const isSelected = selectedStatuses.includes(status);
          const colorClasses = getEvidenceStatusColor(status);

          return (
            <ToggleGroupItem
              key={status}
              value={status}
              aria-label={`Filter by ${status}`}
              className={cn(
                "h-auto px-0 py-0 border-0 rounded-full transition-all",
                "data-[state=on]:bg-transparent data-[state=off]:bg-transparent",
                "hover:scale-105"
              )}
            >
              <Badge
                className={cn(
                  colorClasses,
                  "pointer-events-none transition-opacity text-xs sm:text-sm whitespace-nowrap cursor-pointer",
                  !isSelected && "opacity-40"
                )}
              >
                {status}
              </Badge>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
};
