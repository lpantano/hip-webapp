import React from 'react';

type Step = { id: string; label: string; step: number };
type StandardPhase = { title: string; desc: string; time: string };
type CustomPhase = { title: string; desc: string; threshold: number };

interface Props {
  steps: Step[];
  selectedStep: string;
  setSelectedStep: React.Dispatch<React.SetStateAction<string>>;
  setIsHoveringPath: React.Dispatch<React.SetStateAction<boolean>>;
  PHASE_INFO: Record<string, StandardPhase | CustomPhase>;
}

const ResearchQualityScale: React.FC<Props> = ({ steps, selectedStep, setSelectedStep, setIsHoveringPath, PHASE_INFO }) => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-muted/30 border border-muted rounded-lg p-4">
        <div className="flex flex-col items-center gap-3">
          {/* Compact badge row */}
          <div className="flex items-center justify-center gap-2 w-full">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedStep(s.id)}
                  onMouseEnter={() => setIsHoveringPath(true)}
                  onMouseLeave={() => setIsHoveringPath(false)}
                  className={`group relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                    selectedStep === s.id
                      ? 'bg-accent/70 shadow-sm'
                      : 'hover:bg-accent/30'
                  }`}
                  aria-label={s.label}
                >
                  {/* Badge number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    selectedStep === s.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-200 text-orange-700 group-hover:bg-orange-300'
                  }`}>
                    {s.step}
                  </div>
                  {/* Compact label - hidden on mobile, shown on larger screens */}
                  <div className="hidden sm:block text-[10px] font-medium text-center leading-tight text-muted-foreground max-w-[80px]">
                    {s.label}
                  </div>
                </button>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="h-px w-3 sm:w-6 bg-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>

          {/* Compact details panel */}
          {PHASE_INFO[selectedStep] && (
            <div className="w-full px-4 py-2 bg-background/50 rounded-md border border-muted/50">
              <div className="text-center">
                <div className="font-semibold text-base mb-1">
                  {PHASE_INFO[selectedStep].title}
                  {('threshold' in PHASE_INFO[selectedStep]) && (
                    <span className="text-xs text-muted-foreground ml-2">• Threshold: {PHASE_INFO[selectedStep].threshold}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {PHASE_INFO[selectedStep].desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchQualityScale;
