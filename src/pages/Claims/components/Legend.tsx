import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      <div className="flex flex-wrap justify-center gap-2">
        {/* Small reusable legend chip component */}
        {/**
         * LegendChip is intentionally simple: it renders the visible label and a popover
         * with a description. We render each chip manually (no loop) so the caller can
         * control ordering by arranging calls in the desired sequence.
         */}
        {/** LegendChip component */}
        {(() => {
          function LegendChip({
            title,
            bgClass,
            description,
          }: {
            title?: string | null;
            bgClass: string;
            description: string;
          }) {
            if (!title) return null;
            return (
              <Popover key={title}>
                <PopoverTrigger asChild>
                  <div
                    className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold ${bgClass} hover:opacity-80 transition-opacity`}
                  >
                    {title}
                  </div>
                </PopoverTrigger>
                <PopoverContent side="top" className="max-w-xs text-xs p-3">
                  <div className="font-semibold mb-1">{title}</div>
                  <div>{description}</div>
                </PopoverContent>
              </Popover>
            );
          }

          // Pull individual items by index so we can render them one-by-one
          const i0 = itemsToRender[0];
          const i1 = itemsToRender[1];
          const i2 = itemsToRender[2];
          const i3 = itemsToRender[3];
          const i4 = itemsToRender[4];
          const i5 = itemsToRender[5];
          const i6 = itemsToRender[6];
          const i7 = itemsToRender[7];
          const i8 = itemsToRender[8];
          const i9 = itemsToRender[9];

          const build = (item: LegendItem | undefined) => {
            if (!item) return null;
            const isTag = isStudyTag(item);
            const bg = isTag ? getStudyTagColor(item as TagStudy) : getCategoryBackgroundColor(item as ReviewCategory);
            const desc = isTag ? getStudyTagDescription(item as TagStudy) : getCategoryDescription(item as ReviewCategory);
            return <LegendChip title={String(item)} bgClass={bg} description={desc} />;
          };

          return (
            <>
              {build(i0)}
              {build(i1)}
              <div className="w-full" />
              {build(i2)}
              <div className="w-full" />
              {build(i3)}
              {build(i4)}
              <div className="w-full" />
              {build(i5)}
              {build(i6)}
              <div className="w-full" />
              {build(i7)}
              {build(i8)}
              {build(i9)}
            </>
          );
        })()}
      </div>
    </div>
  );
}
