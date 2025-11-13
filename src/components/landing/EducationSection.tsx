import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ResearchQualityScale from './ResearchQualityScale';
import SampleSizeCard from './EducationSection/SampleSizeCard';
import PopulationDiversityCard from './EducationSection/PopulationDiversityCard';
import StudyDesignCard from './EducationSection/StudyDesignCard';
import AddressingBiasCard from './EducationSection/AddressingBiasCard';
import ResearchConsensusCard from './EducationSection/ResearchConsensusCard';
import { CATEGORY_DESCRIPTIONS } from '@/lib/classification-categories';

const EducationSection = () => {

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
  const onPointerDown = useCallback((e) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // capture the pointer so we keep receiving events
    (e.target as Element).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    // setIsDragging(true);
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = scroller.scrollLeft;
  }, []);

  const onPointerMove = useCallback((e) => {
    const scroller = scrollerRef.current;
    if (!scroller || !isDraggingRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startXRef.current;
    scroller.scrollLeft = scrollLeftStartRef.current - dx;
  }, []);

  const endDrag = useCallback((e) => {
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch (err) {
      // In some environments or older browsers releasePointerCapture may fail.
      // Log a warning so we can debug if this happens in the wild.
      // Avoid throwing so the UI remains responsive.
      console.warn('releasePointerCapture failed in EducationSection endDrag', err);
    }

    isDraggingRef.current = false;
    // setIsDragging(false);
  }, []);

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-8">
            Understanding
            <span className="text-primary"> Research Quality</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn why certain factors make research more trustworthy when evaluating health claims
          </p>
        </div>

        {/* Callout section with 75% statistic */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            {/* <div className="border-accent text-accent-foreground rounded-full px-4 py-3 shadow-lg">
              <div className="text-3xl font-bold">75%</div>
            </div> */}
            <div className="text-center md:text-left max-w-lg">
              <p className="text-lg font-medium text-foreground">
                75% agree that scientific research methods are the best way to find out whether something is true or false
                <a href="https://www.nature.com/articles/s41562-024-02090-5.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-1 hover:text-primary" aria-label="Nature Human Behaviour volume 9, pages 713–730 (2025)">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </p>
            </div>
          </div>

          <div className="text-accent rounded-lg py-3 px-4 text-center mb-6">
            <h3 className="text-xl md:text-xl font-semibold">
              Trust science when it's rigorous and reported honestly.
            </h3>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base text-foreground leading-relaxed">
              Scientific <strong>evidence is only as strong as the methods</strong> behind it. While science is the best way to test whether something is true or false, trustworthy information requires both <strong>rigorous research methods</strong> and <strong>honest, accurate communication</strong> of findings.
            </p>
          </div>
        </div>

        <div className="mb-1 flex justify-center">
            <a href="/workflow" className="inline-flex items-center gap-2 text-xl text-primary hover:underline">
                Learn how we review information and science
                <ExternalLink className="w-4 h-4" />
              </a>
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

        {/* Research quality scale - compact badge style */}
        {/* <ResearchQualityScale
          steps={steps}
          selectedStep={selectedStep}
          setSelectedStep={setSelectedStep}
          setIsHoveringPath={setIsHoveringPath}
          PHASE_INFO={PHASE_INFO}
        /> */}



      </div>
    </section>
  );
};

export default EducationSection;
