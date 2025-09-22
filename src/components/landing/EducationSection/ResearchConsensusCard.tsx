import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResearchConsensusCard = () => {
  const [consensusOpen, setConsensusOpen] = React.useState(false);

  return (
    <Dialog open={consensusOpen} onOpenChange={setConsensusOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-accent/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-xl">Research Consensus</CardTitle>
            <CardDescription>
              When multiple studies agree
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="ghost" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-accent" />
            Understanding Research Consensus
          </DialogTitle>
          <DialogDescription className="text-base">
            Why multiple independent studies reaching the same conclusion provides stronger evidence
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Add detailed content here */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchConsensusCard;
