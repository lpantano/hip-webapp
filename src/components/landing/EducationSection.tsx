import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertTriangle, Target, ChevronLeft, ChevronRight } from 'lucide-react';
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
  // dragging state for pointer/touch support
  const [isDragging, setIsDragging] = useState(false);

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

  // Carousel refs
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const firstGroupRef = useRef<HTMLDivElement | null>(null);

  // define card component list
  const cardComponents = useMemo(() => [
    SampleSizeCard,
    PopulationDiversityCard,
    StudyDesignCard,
    AddressingBiasCard,
    ResearchConsensusCard,
  ], []);

  // pointer drag refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  const scrollByAmount = useCallback((distance: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: distance, behavior: 'smooth' });
  }, []);

  // pointer/touch handlers for dragging
  const onPointerDown = useCallback((e: any) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // capture the pointer so we keep receiving events
    (e.target as Element).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = scroller.scrollLeft;
  }, []);

  const onPointerMove = useCallback((e: any) => {
    const scroller = scrollerRef.current;
    if (!scroller || !isDraggingRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startXRef.current;
    scroller.scrollLeft = scrollLeftStartRef.current - dx;
  }, []);

  const endDrag = useCallback((e: any) => {
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

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
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <div className="bg-accent text-accent-foreground rounded-full px-4 py-3 shadow-lg">
              <div className="text-3xl font-bold">75%</div>
            </div>
            <div className="text-center md:text-left max-w-lg">
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

          <div className="bg-primary text-primary-foreground rounded-lg py-3 px-4 text-center mb-6 shadow-md">
            <h3 className="text-xl md:text-xl font-semibold">
              Trust the science—but only when the science is trustworthy.
            </h3>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base text-foreground leading-relaxed">
              Scientific <strong>evidence is only as strong as the methods</strong> behind it. While science is the best way to test whether something is true or false, the credibility of any result depends on <strong>how carefully the study is designed, conducted, and analyzed</strong>. Reliable conclusions come from research that follows rigorous, transparent, and widely accepted standards.
            </p>
          </div>
        </div>


        { /* Education cards carousel - continuous horizontal rolling with controls */}
        <div className="relative max-w-4xl mx-auto my-4">
          {/* left arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => {
              const first = firstGroupRef.current;
              if (!first) return;
              if (scrollerRef.current) scrollByAmount(-Math.floor(first.scrollWidth / 3));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 hover:bg-background border shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollerRef}
            // allow vertical overflow so hovered/scaled cards aren't clipped
            className={`overflow-x-auto overflow-y-visible rounded-md py-6 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-3 items-stretch px-8">
              {/* first group (measured) */}
              <div ref={firstGroupRef} className="flex gap-3 items-stretch">
                {cardComponents.map((C, i) => (
                  <div key={`card-${i}`} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
                    <C />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => {
              const first = firstGroupRef.current;
              if (!first) return;
              if (scrollerRef.current) scrollByAmount(Math.floor(first.scrollWidth / 3));
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 hover:bg-background border shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
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
