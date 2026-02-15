import { EVIDENCE_STATUS_OPTIONS } from '../constants';
import { getEvidenceStatusColor } from '../utils/helpers';
import { cn } from '@/lib/utils';

interface EvidenceStatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export const EvidenceStatusFilter = ({
  selectedStatuses,
  onStatusChange
}: EvidenceStatusFilterProps) => {
  const handleToggle = (status: string) => {
    const isSelected = selectedStatuses.includes(status);

    if (isSelected) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleShowAll = () => {
    onStatusChange([...EVIDENCE_STATUS_OPTIONS]);
  };

  const isAllSelected = selectedStatuses.length === 0 || selectedStatuses.length === EVIDENCE_STATUS_OPTIONS.length;

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {/* All button */}
      <button
        onClick={handleShowAll}
        className={cn(
          "rounded-full h-8 px-4 text-xs font-medium transition-all",
          isAllSelected
            ? "bg-gray-900 text-white dark:bg-gray-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        )}
      >
        All
      </button>

      {/* Status chips */}
      {EVIDENCE_STATUS_OPTIONS.map((status) => {
        const isSelected = selectedStatuses.includes(status);
        const colorClass = getEvidenceStatusColor(status);

        return (
          <button
            key={status}
            onClick={() => handleToggle(status)}
            className={cn(
              "rounded-full h-8 px-4 text-xs font-medium transition-all text-white",
              isSelected ? colorClass : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400 opacity-60 hover:opacity-80"
            )}
          >
            {status.replace('Evidence ', '')}
          </button>
        );
      })}
    </div>
  );
};
