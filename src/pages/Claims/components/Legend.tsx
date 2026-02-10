import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCategoryBackgroundColor, getCategoryDescription, STUDY_TAG, getStudyTagColor, getStudyTagDescription } from '@/lib/classification-categories';
import type { ReviewCategory, TagStudy } from '@/types/review';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LegendItem = ReviewCategory | TagStudy;

interface Props {
  items?: LegendItem[];
  className?: string;
}

// Default legend order - ordered from negative to positive
const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  'Invalid',
  'Inconclusive',
  'Misinformation',
  'Not Tested in Humans',
  'Women Not Included',
  'Observational',
  'Limited Tested in Humans',
  'Clinical Trial',
  'Tested in Humans',
  'Widely Tested in Humans'
];

// Short labels for compact display
const getShortLabel = (item: LegendItem): string => {
  const shortLabels: Record<string, string> = {
    'Invalid': 'Invalid',
    'Inconclusive': 'Inconclusive',
    'Misinformation': 'Misinfo',
    'Not Tested in Humans': 'No Human Tests',
    'Women Not Included': 'No Women',
    'Observational': 'Observational',
    'Limited Tested in Humans': 'Limited Tests',
    'Clinical Trial': 'Clinical Trial',
    'Tested in Humans': 'Tested',
    'Widely Tested in Humans': 'Widely Tested'
  };
  return shortLabels[item] || item;
};

// Type guard to narrow an item to a study tag (TagStudy)
const isStudyTag = (x: unknown): x is TagStudy => {
  return typeof x === 'string' && (STUDY_TAG as readonly string[]).includes(x);
};

// Individual legend item with tooltip that supports both hover and tap
function LegendItemTooltip({ item }: { item: LegendItem }) {
  const [open, setOpen] = useState(false);

  const isTag = isStudyTag(item);
  const bg = isTag ? getStudyTagColor(item as TagStudy) : getCategoryBackgroundColor(item as ReviewCategory);
  const desc = isTag ? getStudyTagDescription(item as TagStudy) : getCategoryDescription(item as ReviewCategory);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <div
          onClick={handleClick}
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium cursor-help transition-transform hover:scale-105 select-none",
            bg
          )}
        >
          {getShortLabel(item)}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="font-semibold text-sm">{String(item)}</p>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function CategoriesLegend({ items, className }: Props) {
  const itemsToRender = items ?? DEFAULT_LEGEND_ITEMS;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("w-full", className)}>
        <div className="flex flex-wrap items-center gap-2 justify-center py-2 px-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
            <span>Legend:</span>
          </div>
          {itemsToRender.map((item) => {
            if (!item) return null;
            return <LegendItemTooltip key={String(item)} item={item} />;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
