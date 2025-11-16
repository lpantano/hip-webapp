import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, FlaskConical, Stethoscope, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SciencePathSection = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const researchSteps = [
    {
      id: 'observational',
      icon: Eye,
      title: 'Observational Studies',
      subtitle: 'Watching & Learning',
      description: 'Scientists observe people in their everyday lives to spot patterns and connections.',
      color: 'text-blue-500',
      bgColor: 'bg-evidence-observational',
      detailedContent: {
        whatIsIt: 'Observational studies watch groups of people over time without changing anything about their lives. Researchers collect data on habits, health conditions, and outcomes.',
        example: 'A study might follow 10,000 women for 10 years, tracking their coffee consumption and heart health. If women who drink coffee have fewer heart attacks, that\'s an interesting pattern—but it doesn\'t prove coffee prevents heart disease.',
        strengths: [
          'Good for finding patterns and generating hypotheses',
          'Can study large populations over long periods',
          'Ethical when experiments would be harmful',
          'Reflects real-world conditions'
        ],
        limitations: [
          'Cannot prove cause and effect',
          'Many confounding factors (coffee drinkers might also exercise more)',
          'Participants may not accurately report behaviors',
          'Cannot control for all variables'
        ],
        realWorld: 'The link between smoking and lung cancer was first discovered through observational studies. While they couldn\'t prove causation alone, they provided crucial early evidence that led to further research.'
      }
    },
    {
      id: 'preclinical',
      icon: FlaskConical,
      title: 'Preclinical',
      subtitle: 'Lab Testing',
      description: 'Testing ideas in cells and animals before moving to human trials.',
      color: 'text-orange-600',
      bgColor: 'bg-evidence-not-tested',
      detailedContent: {
        whatIsIt: 'Preclinical research tests potential treatments in laboratory settings—first in cells (in vitro), then in animals (in vivo)—before any human testing begins.',
        example: 'Scientists discover a compound that kills cancer cells in a petri dish. They then test it in mice with tumors to see if it works in a living body, what dose is safe, and what side effects occur.',
        strengths: [
          'Tests safety before human exposure',
          'Allows precise control of variables',
          'Can study biological mechanisms in detail',
          'Faster and less expensive than human trials'
        ],
        limitations: [
          'Animal biology differs from human biology',
          'Many treatments that work in animals fail in humans (about 90%)',
          'Lab conditions don\'t match real-world complexity',
          'Ethical concerns about animal testing'
        ],
        realWorld: 'Most potential drugs never make it past this stage. For example, many Alzheimer\'s treatments showed promise in mice but failed to help humans because mouse brains age differently than human brains.'
      }
    },
    {
      id: 'clinical',
      icon: Stethoscope,
      title: 'Clinical Trials',
      subtitle: 'Human Testing',
      description: 'Carefully controlled studies testing safety and effectiveness in people.',
      color: 'text-blue-800',
      bgColor: 'bg-evidence-tested',
      detailedContent: {
        whatIsIt: 'Clinical trials test treatments in humans through carefully designed phases. They use control groups, randomization, and blinding to ensure results are reliable.',
        example: 'A new menopause treatment is tested in 500 women. Half receive the treatment, half get a placebo. Neither doctors nor patients know who gets what (double-blind). After 6 months, researchers compare symptoms between groups.',
        strengths: [
          'Directly tests effects in humans',
          'Randomization reduces bias',
          'Placebo controls account for psychological effects',
          'Regulatory oversight ensures safety',
          'Can prove cause and effect when well-designed'
        ],
        limitations: [
          'Expensive and time-consuming (often years)',
          'Strict criteria may exclude diverse populations',
          'Short trial periods may miss long-term effects',
          'Dropout rates can affect results',
          'Publication bias (negative results often unpublished)'
        ],
        realWorld: 'The COVID-19 vaccine trials enrolled tens of thousands of people and showed clear evidence: vaccinated groups had significantly fewer infections than placebo groups, proving the vaccines work.'
      }
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Research
            <span className="text-primary"> Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Understanding how scientific evidence is built—from initial observations to proven treatments.
          </p>
        </div>

        {/* Three-step pathway (single row: Preclinical -> Observational -> Clinical) */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {[researchSteps[1], researchSteps[0], researchSteps[2]].map((step) => {
                const Icon = step.icon;
                return (
                  <Dialog key={step.id} open={openDialog === step.id} onOpenChange={(open) => setOpenDialog(open ? step.id : null)}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 w-full h-full">
                        <CardContent className="p-4 h-full flex flex-col">
                          <div className="flex items-center justify-between gap-3">
                            {/* Icon on left */}
                            <div className={`p-2 ${step.bgColor} rounded-lg flex-shrink-0`}>
                              <Icon className={`h-6 w-6 ${step.color}`} />
                            </div>

                            {/* Title and subtitle in center */}
                            <div className="flex-1">
                              <h3 className="font-semibold md:text-me text-base text-foreground">
                                {step.title}
                                <Button variant="ghost" size="sm" className="h-12 w-18 p-0 flex-shrink-0 ml-2">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </h3>
                              <p className={`text-xs ${step.color}`}>
                                {step.subtitle}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                          <div className={`p-2 ${step.bgColor} rounded-lg`}>
                            <Icon className={`h-6 w-6 ${step.color}`} />
                          </div>
                          {step.title}
                        </DialogTitle>
                        <DialogDescription className={`text-lg font-medium ${step.color}`}>
                          {step.subtitle}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* What is it */}
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-foreground">What is it?</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.detailedContent.whatIsIt}
                          </p>
                        </div>

                        {/* Example */}
                        <div className={`${step.bgColor} p-4 rounded-lg border-l-4 ${step.color.replace('text-', 'border-')}`}>
                          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <span>💡</span> Real Example
                          </h3>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {step.detailedContent.example}
                          </p>
                        </div>

                        {/* Strengths */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                            <span className="text-green-600">✓</span> Strengths
                          </h3>
                          <ul className="space-y-2">
                            {step.detailedContent.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">•</span>
                                <span className="text-muted-foreground text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Limitations */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                            <span className="text-amber-600">⚠</span> Limitations
                          </h3>
                          <ul className="space-y-2">
                            {step.detailedContent.limitations.map((limitation, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span className="text-muted-foreground text-sm">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Real-world impact */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <span>🌍</span> Real-World Impact
                          </h3>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {step.detailedContent.realWorld}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </div>

          {/* Bottom explanation */}
          {/* <div className="mt-12 text-center max-w-3xl mx-auto">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                Why This Matters for Your Health
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Each step builds on the previous one, creating stronger evidence. A treatment that's only been studied in cells or animals
                might not work in humans. But when a treatment shows benefits across <strong>all three stages</strong>—observation,
                preclinical testing, and clinical trials—we can be much more confident it actually works.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong>Click each card</strong> to learn the strengths and limitations of each research type, so you can better
                evaluate health claims you encounter.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default SciencePathSection;
