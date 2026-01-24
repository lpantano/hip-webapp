import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface SortSelectProps {
  value: 'votes' | 'recent';
  onChange: (value: 'votes' | 'recent') => void;
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'votes', label: 'Most Votes' }
] as const;

export const SortSegmentedControl = ({ value, onChange }: SortSelectProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as 'votes' | 'recent')}>
      <SelectTrigger className="w-full sm:w-[160px] h-9">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <SelectValue placeholder="Sort by" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
