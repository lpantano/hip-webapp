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
    const stack: React.ReactNode[] = [];

    levelDefs.forEach((lvl) => {
    const labels = lvl.labels;

    // For level 1 (PROBLEMATIC_CATEGORIES), render each category separately if it has a count
    if (lvl.level === 1) {
        labels.forEach((label) => {
            const count = labelCounts[label] || 0;
            if (count > 0) {
                const color = getCategoryBackgroundColor(label);
                stack.push(
                    <Popover key={`${label}-${stance}`}>
                        <PopoverTrigger asChild>
                            <div
                                className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-lg ${color} px-2 sm:px-3 py-1 text-xs font-semibold overflow-hidden cursor-pointer`}
                            >
                                <span className="break-words">{label}</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({count})</span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="max-w-xs text-xs p-2">
                            <div className="font-semibold mb-1">{label}</div>
                            <div>{getCategoryDescription(label as ReviewCategory)}</div>
                        </PopoverContent>
                    </Popover>
                );
            }
        });
    } else {
        // For other levels, aggregate as before
        const counts = labels.map(l => labelCounts[l] || 0);
        const totalCount = counts.reduce((a,b) => a + b, 0);

        if (totalCount > 0) {
            // Determine representative label
            let repLabel = labels[0];
            if (labels.length > 1) {
                let maxIdx = 0;
                let maxVal = counts[0] || 0;
                for (let i = 1; i < counts.length; i++) {
                    if ((counts[i] || 0) > maxVal) {
                        maxVal = counts[i] || 0;
                        maxIdx = i;
                    }
                }
                if (maxVal > 0) repLabel = labels[maxIdx];
            }

            const color = getCategoryBackgroundColor(repLabel);

            stack.push(
                <Popover key={`lvl-${lvl.level}-${stance}`}>
                    <PopoverTrigger asChild>
                        <div
                            className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-lg ${color} px-2 sm:px-3 py-1 text-xs font-semibold overflow-hidden cursor-pointer`}
                        >
                            <span className="break-words">{repLabel}</span>
                            <span className="ml-1 sm:ml-2 flex-shrink-0">({totalCount})</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="max-w-xs text-xs p-2">
                        <div className="font-semibold mb-1">{repLabel}</div>
                        <div>{getCategoryDescription(repLabel as ReviewCategory)}</div>
                    </PopoverContent>
                </Popover>
            );
        }
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
                                    className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('women_not_included')} overflow-hidden cursor-pointer`}
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
                                    className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('observational')} overflow-hidden cursor-pointer`}
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
        stack.push(<span key={`no-labels-${stance}`} className='text-xs text-gray-500'>No labels</span>);
    }
    return (
        <div className="flex flex-col w-auto items-start">
            {stack}
        </div>
    );
}
