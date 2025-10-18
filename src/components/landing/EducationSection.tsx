import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertTriangle, Target } from 'lucide-react';
import SampleSizeCard from './EducationSection/SampleSizeCard';
import PopulationDiversityCard from './EducationSection/PopulationDiversityCard';
import PitfallsCard from './EducationSection/PitfallsCard';

const EducationSection = () => {
  // interactive research path state
  const [selectedStep, setSelectedStep] = useState<string>('Basic Research');
  const [pitfallOpen, setPitfallOpen] = useState(false);

  const steps = useMemo(() => [
    { id: 'unreliable', label: 'Unreliable' , step: 1},
    { id: 'notTestedInHuman', label: 'No Tested in Humans', step: 2 },
    { id: 'limitedTestedInHuman', label: 'Limited Tested in Humans', step: 3 },
    { id: 'testedInHuman', label: 'Tested in Humans', step: 4 },
    { id: 'widelyTestedInHuman', label: 'Widely Tested in Humans', step: 5 },

  ], []);

  // auto-advance the selected step every 3 seconds
  const [isHoveringPath, setIsHoveringPath] = useState(false);

  useEffect(() => {
    if (isHoveringPath) return; // pause when hovering
    const interval = setInterval(() => {
      setSelectedStep((prev) => {
        const idx = steps.findIndex((s) => s.id === prev);
        const next = steps[(idx + 1) % steps.length];
        return next.id;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [steps, isHoveringPath]);

  type StandardPhase = { title: string; desc: string; time: string };
  type CustomPhase = { title: string; desc: string; threshold: number };
  const PHASE_INFO: Record<string, StandardPhase | CustomPhase> = {

    'unreliable': {
      title: 'Unreliable Research',
      desc: 'Fails to pass at least one of the five quality checks (such as peer review, control group, blinding, randomization, or preregistration).',
      threshold: 0
    },
    'notTestedInHuman': {
      title: 'Not Tested in Humans',
      desc: 'Research focused only on cells or animals, with no human participants.',
      threshold: 1
    },
    'limitedTestedInHuman': {
      title: 'Limited Human Testing',
      desc: 'Tested in humans, but with fewer than 100 participants in total.',
      threshold: 2
    },
    'testedInHuman': {
      title: 'Tested in Humans',
      desc: 'Tested in humans with more than 100 participants.',
      threshold: 3
    },
    'widelyTestedInHuman': {
      title: 'Widely Tested in Humans',
      desc: 'Tested in humans with more than 500,000 participants across studies.',
      threshold: 4
    }
  };

  const PITFALLS = [
    {
      id: 'Placebo Effect',
      title: 'Placebo Effect',
      description: 'When participants experience a perceived improvement in symptoms simply because they believe they are receiving treatment.',
      example: 'In a trial for pain relief, patients given sugar pills reported reduced pain despite no active ingredient.'
    },
    {
      id: 'Nocebo Effect',
      title: 'Nocebo Effect',
      description: 'When participants experience negative effects due to their expectations of harm from a treatment.',
      example: 'Patients warned about side effects of a drug reported headaches, even when given a harmless placebo.'
    },
    {
      id: 'Confounding Effect',
      title: 'Confounding Effect',
      description: 'When an outside factor influences both the treatment and outcome, making it hard to determine the true cause.',
      example: 'A study linking coffee to heart disease didn’t account for the fact that coffee drinkers were more likely to smoke.'
    }
  ];

  const [selectedPitfall, setSelectedPitfall] = useState<string | null>(null);

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-hero-gradient bg-clip-text text-transparent">
            Understanding Research Quality
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn why certain factors make research more trustworthy when evaluating health claims
          </p>
        </div>

        {/* Research development path (new) */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-card/60 border border-border rounded-lg p-4">
            {/* interactive path: clickable steps show details below */}
            {/* use existing useState already present in this file for other dialogs */}
            {/* define phase info inline so translations/changes are easy */}
            <div className="flex flex-col items-start">
              <div className="flex flex-wrap items-center justify-center gap-4 w-full py-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedStep(s.id)}
                      onMouseEnter={() => setIsHoveringPath(true)}
                      onMouseLeave={() => setIsHoveringPath(false)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md min-w-[90px] max-w-[120px] break-words ${selectedStep === s.id ? 'ring-2 ring-primary/40 bg-primary/5' : 'hover:bg-muted/30'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-center ${selectedStep === s.id ? 'bg-primary/20' : 'bg-primary/10'}`}>{s.step}</div>
                      <div className="text-xs font-medium text-center leading-tight break-words">{s.label}</div>
                    </button>
                    {i < steps.length - 1 && <div className="h-px w-4 bg-border mx-1" />}
                  </div>
                ))}
              </div>

              {/* details panel - fixed height to prevent layout shifts when content changes */}
              <div className="w-full mt-4 p-4 bg-background/80 rounded h-[140px] md:h-[180px] overflow-auto">
                {PHASE_INFO[selectedStep] && (
                  <div>
                    <div className="font-semibold text-lg">
                      {PHASE_INFO[selectedStep].title}
                      {('time' in PHASE_INFO[selectedStep]) ? (
                        <span className="text-sm text-muted-foreground"> • {PHASE_INFO[selectedStep].time}</span>
                      ) : null}
                      {('threshold' in PHASE_INFO[selectedStep]) ? (
                        <span className="text-sm text-muted-foreground"> • Threshold: {PHASE_INFO[selectedStep].threshold}</span>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{PHASE_INFO[selectedStep].desc}</div>
                  </div>
                )}
              </div>
            </div>

            {/* end interactive path; the existing 3-column summary follows (kept unchanged) */}
            {/* <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-muted/30 rounded">
                <div className="font-semibold">Phase 1 — Safety</div>
                <div className="text-xs text-muted-foreground">Small group of healthy volunteers to test safety, dosing and side effects.</div>
              </div>
              <div className="p-3 bg-muted/30 rounded">
                <div className="font-semibold">Phase 2 — Efficacy</div>
                <div className="text-xs text-muted-foreground">Larger group to evaluate effectiveness and short-term side effects.</div>
              </div>
              <div className="p-3 bg-muted/30 rounded">
                <div className="font-semibold">Phase 3 — Confirmation</div>
                <div className="text-xs text-muted-foreground">Large, multi-site trials to confirm benefit-risk profile and rare adverse events.</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <SampleSizeCard />
          <PopulationDiversityCard />
          <PitfallsCard />
        </div> */}

        {/* Dialog for pitfall details */}
        <Dialog open={pitfallOpen} onOpenChange={(open) => { setPitfallOpen(open); if (!open) setSelectedPitfall(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPitfall ? PITFALLS.find((p) => p.id === selectedPitfall)?.title : 'Common Pitfalls in Research Analysis'}
              </DialogTitle>
              <DialogDescription>
                {selectedPitfall ? PITFALLS.find((p) => p.id === selectedPitfall)?.description : 'These are common pitfalls to watch for when analyzing research.'}
              </DialogDescription>
            </DialogHeader>

            {selectedPitfall ? (
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="font-medium mb-2">What this means</div>
                <div className="mb-3">{PITFALLS.find((p) => p.id === selectedPitfall)?.description}</div>
                <div className="font-medium mb-2">Example</div>
                <div className="mb-4">{PITFALLS.find((p) => p.id === selectedPitfall)?.example}</div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="font-medium mb-2">Common Pitfalls</div>
                <ul className="list-disc pl-5 space-y-2">
                  {PITFALLS.map((pitfall) => (
                    <li key={pitfall.id}><span className="font-medium">{pitfall.title}:</span> {pitfall.description}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={() => setPitfallOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default EducationSection;
