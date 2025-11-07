import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getCategoryBackgroundColor, getCategoryBorderColor } from '@/lib/classification-categories';
import { PROBLEMATIC_CATEGORIES } from '@/lib/classification-categories';
import { getStudyTagColor, getStudyTagDescription, getCategoryDescription } from '@/lib/classification-categories';
import type { ReviewCategory } from '@/types/review';

type Props = {
  classificationOrder: string[];
  labelCounts: Record<string, number>;
  womenNotIncludedCount: number;
  observationalCount?: number;
  clinicalTrialCount?: number;
  stance: 'supporting' | 'contradicting';
  aggregatedReasonsForStance: Record<string, string[]>;
};

export default function ClaimLabelsStack({ classificationOrder, labelCounts, womenNotIncludedCount, observationalCount = 0, clinicalTrialCount = 0, stance, aggregatedReasonsForStance }: Props) {
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
    { level: 1, labels: [...PROBLEMATIC_CATEGORIES] }
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

    const color = getCategoryBackgroundColor(repLabel);
    // split into parts so we can prefer a darker text-derived border and also use bg/text when expanding
    // const borderClass = getEvidenceClassificationBorder(repLabel);

    // If present, render a full badge; if absent, render thin colored line
    if (totalCount > 0) {
        // For level1 with multiple labels present, if more than one present we show the chosen repLabel name
        const titleLabel = (labels.length > 1 && counts.filter(c => c>0).length > 1)
        ? repLabel
        : repLabel;


                return (
                    <Popover key={`lvl-${lvl.level}-${stance}`}>
                        <PopoverTrigger asChild>
                            <div
                                className={`w-full sm:inline-flex sm:w-auto items-center rounded-lg ${color} px-2 sm:px-3 py-1 text-xs font-semibold overflow-hidden cursor-pointer`}
                            >
                                <span className="break-words">{titleLabel}</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({totalCount})</span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            <div className="font-semibold mb-1">{titleLabel}</div>
                            <div>{getCategoryDescription(titleLabel as ReviewCategory)}</div>
                        </PopoverContent>
                    </Popover>
                );
    }


});


// Small helper component that renders a button which shows a compact closedNode (small bar)
// and expands to show openNode (text inside) when clicked. Keeps internal open state per stack via a shared prop.
function LevelButton({
    level,
    closedNode,
    openNode,
    closedStyle,
    openStyle,
}: {
    level: number;
    closedNode: React.ReactNode;
    openNode: React.ReactNode;
    closedStyle?: React.CSSProperties;
    openStyle?: React.CSSProperties;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="mb-1 relative inline-block">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center focus:outline-none"
                aria-expanded={open}
            >
                <div
                    className={`transition-all duration-150 ease-in-out inline-block`}
                    style={open ? openStyle : closedStyle}
                >
                    {open ? openNode : closedNode}
                </div>
            </button>
        </div>
    );
}

  // If any womenNotIncluded flag, append it at the bottom (after level 1)
        if (womenNotIncludedCount > 0) {
                stack.push(
                        <Popover key={`women-pop-${stance}`}>
                            <PopoverTrigger asChild>
                                <div
                                    className={`mt-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('women_not_included')} overflow-hidden cursor-pointer`}
                                >
                                    <span className="break-words">Women Not Included</span>
                                    <span className="ml-1 sm:ml-2 flex-shrink-0">({womenNotIncludedCount})</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                {getStudyTagDescription('Women Not Included')}
                            </PopoverContent>
                        </Popover>
                );
        }

    // Add study type labels if present
        if (observationalCount > 0) {
                stack.push(
                        <Popover key={`observational-pop-${stance}`}>
                            <PopoverTrigger asChild>
                                <div
                                    className={`mt-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('observational')} overflow-hidden cursor-pointer`}
                                >
                                    <span className="break-words">Observational</span>
                                    <span className="ml-1 sm:ml-2 flex-shrink-0">({observationalCount})</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                {getStudyTagDescription('Observational')}
                            </PopoverContent>
                        </Popover>
                );
        }

        if (clinicalTrialCount > 0) {
                stack.push(
                        <Popover key={`clinical-pop-${stance}`}>
                            <PopoverTrigger asChild>
                                <div
                                    className={`mt-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('clinical trial')} overflow-hidden cursor-pointer`}
                                >
                                    <span className="break-words">Clinical Trial</span>
                                    <span className="ml-1 sm:ml-2 flex-shrink-0">({clinicalTrialCount})</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                {getStudyTagDescription('Clinical Trial')}
                            </PopoverContent>
                        </Popover>
                );
        }

    if (stack.length === 0) {
        stack.push(<span className='text-xs text-gray-500'>No labels</span>);
    }
    return (
        <div className="flex flex-col w-auto items-start">
            {stack}
        </div>
    );
}
