import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SampleSizeCard from './EducationSection/SampleSizeCard';
import PopulationDiversityCard from './EducationSection/PopulationDiversityCard';
import StudyDesignCard from './EducationSection/StudyDesignCard';
import AddressingBiasCard from './EducationSection/AddressingBiasCard';
import ResearchConsensusCard from './EducationSection/ResearchConsensusCard';

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

        {/* Callout section with 75% statistic */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <div className="bg-accent text-accent-foreground rounded-full px-8 py-6 shadow-lg">
              <div className="text-5xl font-bold">75%</div>
            </div>
            <div className="text-center md:text-left max-w-xl">
              <p className="text-lg font-medium text-foreground">
                Agree that scientific research methods are the best way to find out whether something is true or false
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <a href="https://www.nature.com/articles/s41562-024-02090-5.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  Nature Human Behaviour
                </a> volume 9, pages 713–730 (2025)
              </p>
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-lg py-6 px-8 text-center mb-6 shadow-md">
            <h3 className="text-2xl md:text-3xl font-semibold">
              Trust the science—but only when the science is trustworthy.
            </h3>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base text-foreground leading-relaxed">
              Scientific <strong>evidence is only as strong as the methods</strong> behind it. While science is the best way to test whether something is true or false, the credibility of any result depends on <strong>how carefully the study is designed, conducted, and analyzed</strong>. Reliable conclusions come from research that follows rigorous, transparent, and widely accepted standards.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <SampleSizeCard />
          <PopulationDiversityCard />
          <StudyDesignCard />
          <AddressingBiasCard />
          <ResearchConsensusCard />
        </div>

        {/* Research quality scale - compact badge style */}
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
