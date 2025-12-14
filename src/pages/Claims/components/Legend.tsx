import React from 'react';
import { CLASSIFICATION_CATEGORIES, getCategoryBackgroundColor, getCategoryDescription, STUDY_TAG, getStudyTagColor, getStudyTagDescription } from '@/lib/classification-categories';
import type { ReviewCategory, TagStudy } from '@/types/review';

export type LegendItem = ReviewCategory | TagStudy;

interface Props {
  // optional override; if not provided the component will use the default ordered list
  items?: LegendItem[];
  className?: string;
}

// Default legend order (moved here so the component owns the ordering)
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

// Type guard to narrow an item to a study tag (TagStudy)
const isStudyTag = (x: unknown): x is TagStudy => {
  return typeof x === 'string' && (STUDY_TAG as readonly string[]).includes(x);
};

export default function CategoriesLegend({ items, className }: Props) {
  const itemsToRender = items ?? DEFAULT_LEGEND_ITEMS;

  return (
    <div className={className}>
      <div className="space-y-2">
        {itemsToRender.map((item) => {
          if (!item) return null;

          const isTag = isStudyTag(item);
          const bg = isTag ? getStudyTagColor(item as TagStudy) : getCategoryBackgroundColor(item as ReviewCategory);
          const desc = isTag ? getStudyTagDescription(item as TagStudy) : getCategoryDescription(item as ReviewCategory);

          return (
            <div key={String(item)} className="flex items-start gap-3">
              <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${bg} flex-shrink-0 w-[200px]`}>
                {String(item)}
              </div>
              <div className="text-sm text-left text-muted-foreground pt-1 flex-1">
                {desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
