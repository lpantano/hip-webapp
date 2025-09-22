import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, CheckCircle, BookOpen, BarChart3, Target, Globe, FileText, Award } from 'lucide-react';
import SampleSizeCard from './EducationSection/SampleSizeCard';
import PopulationDiversityCard from './EducationSection/PopulationDiversityCard';
import ResearchConsensusCard from './EducationSection/ResearchConsensusCard';
import EvidenceQualityCard from './EducationSection/EvidenceQualityCard';

const EducationSection = () => {
  // interactive research path state
  const [selectedStep, setSelectedStep] = useState<string>('Basic Research');
  const [sampleSizeOpen, setSampleSizeOpen] = useState(false);
  const [populationOpen, setPopulationOpen] = useState(false);
  const [consensusOpen, setConsensusOpen] = useState(false);
  const [evidenceQualityOpen, setEvidenceQualityOpen] = useState(false);

  const steps = useMemo(() => [
    { id: 'Basic Research', label: 'BR' },
    { id: 'Preclinical', label: 'Pre' },
    { id: 'Phase 1', label: '1' },
    { id: 'Phase 2', label: '2' },
    { id: 'Phase 3', label: '3' },
    { id: 'Approval / Product', label: '✓' },
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

  const PHASE_INFO: Record<string, { title: string; desc: string; time: string }> = {
    'Basic Research': {
      title: 'Basic Research',
      desc: 'Laboratory and theoretical work to discover biological mechanisms and generate hypotheses — often using cell models and biochemical studies.',
      time: 'Months → years (commonly 1–5 years)'
    },
    'Preclinical': {
      title: 'Preclinical',
      desc: 'Tests in cells and animal models (e.g., mice, rats) to evaluate safety, dosing, and proof-of-concept before human studies.',
      time: '1–3 years'
    },
    'Phase 1': {
      title: 'Phase 1 — Safety',
      desc: 'Small trials in healthy volunteers (or patients) focused on safety, tolerability, and dosing.',
      time: 'Months → 1 year'
    },
    'Phase 2': {
      title: 'Phase 2 — Efficacy & Dose',
      desc: 'Larger trials to assess whether the intervention shows evidence of benefit and to refine dose/usage.',
      time: '1–3 years'
    },
    'Phase 3': {
      title: 'Phase 3 — Confirmation',
      desc: 'Large, often multi-site randomized trials to confirm efficacy and monitor less common side effects.',
      time: '2–6 years'
    },
    'Approval / Product': {
      title: 'Regulatory Review & Product',
      desc: 'Regulatory submission, review, and post-approval surveillance leading to market availability.',
      time: '1–2 years (varies by region)'
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
    <section className="py-16 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
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
              <div className="flex items-center gap-4 w-full overflow-x-auto py-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedStep(s.id)}
                      onMouseEnter={() => setIsHoveringPath(true)}
                      onMouseLeave={() => setIsHoveringPath(false)}
                      className={`flex items-center gap-3 p-2 rounded-md ${selectedStep === s.id ? 'ring-2 ring-primary/40 bg-primary/5' : 'hover:bg-muted/30'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${selectedStep === s.id ? 'bg-primary/20' : 'bg-primary/10'}`}>{s.label}</div>
                      <div className="text-sm font-medium">{s.id}</div>
                    </button>

                    {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-3 hidden md:block" />}
                  </div>
                ))}
              </div>

              {/* details panel */}
              <div className="w-full mt-4 p-4 bg-background/80 rounded">
                {PHASE_INFO[selectedStep] && (
                  <div>
                    <div className="font-semibold text-lg">{PHASE_INFO[selectedStep].title} <span className="text-sm text-muted-foreground">• {PHASE_INFO[selectedStep].time}</span></div>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <SampleSizeCard />
          <PopulationDiversityCard />
          <ResearchConsensusCard />
          <EvidenceQualityCard />
        </div>

        {/* Common Pitfalls Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-card/60 border border-border rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Common Pitfalls in Research Analysis</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {PITFALLS.map((pitfall) => (
                <button
                  key={pitfall.id}
                  onClick={() => setSelectedPitfall(pitfall.id)}
                  className="p-4 bg-muted/30 rounded hover:bg-muted/50 transition"
                >
                  <div className="font-semibold text-lg">{pitfall.title}</div>
                </button>
              ))}
            </div>

            {/* Pitfall Details */}
            {selectedPitfall && (
              <div className="mt-6 p-4 bg-background/80 rounded">
                <button
                  onClick={() => setSelectedPitfall(null)}
                  className="text-sm text-primary underline mb-2"
                >
                  Back to list
                </button>
                <div className="font-semibold text-lg">{PITFALLS.find((p) => p.id === selectedPitfall)?.title}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {PITFALLS.find((p) => p.id === selectedPitfall)?.description}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <strong>Example:</strong> {PITFALLS.find((p) => p.id === selectedPitfall)?.example}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
