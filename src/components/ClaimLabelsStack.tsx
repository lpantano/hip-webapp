import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getEvidenceClassificationColor } from '@/lib/classification-colors';

type Props = {
  classificationOrder: string[];
  labelCounts: Record<string, number>;
  womenNotIncludedCount: number;
  stance: 'supporting' | 'contradicting';
  aggregatedReasonsForStance: Record<string, string[]>;
};

export default function ClaimLabelsStack({ classificationOrder, labelCounts, womenNotIncludedCount, stance, aggregatedReasonsForStance }: Props) {
  // Define levels: bottom (1) -> top (5). We'll render top->bottom so top is first in DOM.
  const levelDefs: Array<{
    level: number;
    labels: string[]; // for level 1 this is multiple
    displayLabel?: string; // label to show when present (for level1 we'll pick one)
  }> = [
    { level: 5, labels: ['Widely Tested in Humans'] },
    { level: 4, labels: ['Tested in Humans'] },
    { level: 3, labels: ['Limited Tested in Humans'] },
    { level: 2, labels: ['Not Tested in Humans'] },
    { level: 1, labels: ['Invalid', 'Unreliable', 'Fallacy'] }
  ];

  // Build stack from top (5) to bottom (1)
  const stack = levelDefs.map((lvl) => {
    // For level 1 we aggregate counts across its labels
    const labels = lvl.labels;
    const counts = labels.map(l => labelCounts[l] || 0);
    const totalCount = counts.reduce((a,b) => a + b, 0);

    // Determine representative label for coloring and title when multiple labels exist at level 1
    let repLabel = labels[0];
    if (labels.length > 1) {
      // pick the label with highest count if any; fallback to first
      let maxIdx = 0;
      let maxVal = counts[0] || 0;
      for (let i = 1; i < counts.length; i++) {
        if ((counts[i] || 0) > maxVal) {
          maxVal = counts[i] || 0;
          maxIdx = i;
        }
      }
      if (maxVal > 0) repLabel = labels[maxIdx];
      else repLabel = labels[0];
    }

    const color = getEvidenceClassificationColor(repLabel);

    // merge reasons for all labels in this level
    const reasons: string[] = [];
    labels.forEach((l) => {
      const r = aggregatedReasonsForStance[l] || [];
      if (r.length > 0) reasons.push(...r);
    });

    // If present, render a full badge; if absent, render thin colored line
    if (totalCount > 0) {
      // For level1 with multiple labels present, if more than one present we show the chosen repLabel name
      const titleLabel = (labels.length > 1 && counts.filter(c => c>0).length > 1)
        ? repLabel
        : repLabel;

      const content = (
        <span
          key={`level-${lvl.level}`}
          className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ${color} mb-1 w-auto`}
          style={{ borderWidth: 0, minWidth: 0 }}
        >
          {titleLabel} <span className="ml-2">({totalCount})</span>
        </span>
      );

      if (reasons.length > 0) {
        return (
          <Popover key={`lvl-pop-${lvl.level}`}>
            <PopoverTrigger asChild>
              <div className="cursor-help">{content}</div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Reasons for {repLabel} classification:</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {Array.from(new Set(reasons)).map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        );
      }

      return <div key={`lvl-${lvl.level}`}>{content}</div>;
    }

    // absent -> thin colored line (20% width, centered)
    return (
      <div key={`lvl-line-${lvl.level}`} className="mb-1 w-full flex ">
        <div className={`h-1 rounded ${color}`} style={{ width: '20%' }} />
      </div>
    );
  });

  // If any womenNotIncluded flag, append it at the bottom (after level 1)
  if (womenNotIncludedCount > 0) {
    stack.push(
      <div key={`women-${stance}`} className="mt-1 w-full">
        <span
          className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 w-auto"
          style={{ minWidth: 0 }}
        >
          ♀ Women Not Included <span className="ml-2">({womenNotIncludedCount})</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-auto">
      {stack}
    </div>
  );
}
