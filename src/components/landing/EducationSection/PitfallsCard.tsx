import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const PitfallsCard = () => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Common Pitfalls</CardTitle>
            <CardDescription>
              Mistakes that can mislead research conclusions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="ghost" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Common Pitfalls in Research Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            These are common pitfalls to watch for when analyzing research.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {PITFALLS.map((pitfall) => (
            <div key={pitfall.id} className="bg-muted/10 rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-md">{pitfall.title}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{pitfall.description}</div>
              <div className="text-xs text-muted-foreground"><span className="font-medium">Example:</span> {pitfall.example}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PitfallsCard;
