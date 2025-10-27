import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getEvidenceClassificationColor } from '@/lib/classification-colors';
import { getEvidenceClassificationBorder } from '@/lib/classification-colors';

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
    // split into parts so we can prefer a darker text-derived border and also use bg/text when expanding
    // const borderClass = getEvidenceClassificationBorder(repLabel);

    // If present, render a full badge; if absent, render thin colored line
    if (totalCount > 0) {
        // For level1 with multiple labels present, if more than one present we show the chosen repLabel name
        const titleLabel = (labels.length > 1 && counts.filter(c => c>0).length > 1)
        ? repLabel
        : repLabel;

                // Filled bar: expand in-place to show text inside the bar when clicked
                // return (
                //     <LevelButton
                //         key={`lvl-${lvl.level}`}
                //         level={lvl.level}
                //         closedNode={<div className={`h-2 rounded ${color}`} />}
                //         openNode={
                //             <div className={`rounded ${color} px-3 py-1 text-xs font-semibold flex items-center`}>
                //                 <span className="truncate">{titleLabel}</span>
                //                 <span className="ml-2">({totalCount})</span>
                //             </div>
                //         }
                //         closedStyle={{ width: '20%', minWidth: 80 }}
                //         openStyle={{ minWidth: 120 }}
                //         />
                // );
                return (
                    <div key={`lvl-${lvl.level}`} className={`inline-flex items-center rounded-lg ${color} px-3 py-1 text-xs font-semibold`}> 
                        <span className="truncate">{titleLabel}</span>
                        <span className="ml-2">({totalCount})</span>
                    </div>
                );
    }
    
    // absent -> thin colored line (20% width, centered) with colored border and transparent background
        // Absent: show bordered thin bar, but when opened we'll fill it with bg/text and show label inside
        // return (
        //     <LevelButton
        //         key={`lvl-line-${lvl.level}`}
        //         level={lvl.level}
        //         closedNode={<div className={`h-2 rounded border-2 ${borderClass} bg-transparent`} />}
        //         openNode={
        //             <div className={`rounded ${borderClass} bg-opacity-50 px-3 py-1 text-xs font-semibold flex items-center`}>
        //                 <span className="truncate">{labels.join(', ')}</span>
        //             </div>
        //         }
        //         closedStyle={{ width: '20%', minWidth: 80 }}
        //         openStyle={{ minWidth: 120 }}
        //     />
        // );
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
            <div key={`women-${stance}`} className="mt-1 w-auto">
            <span
                className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 w-auto"
                style={{ minWidth: 0 }}
            >
                ♀ Women Not Included <span className="ml-2">({womenNotIncludedCount})</span>
            </span>
            </div>
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
