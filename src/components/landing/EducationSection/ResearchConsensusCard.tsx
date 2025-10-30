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
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Consensus</CardTitle>
            <CardDescription className="text-base font-medium">
              Repeated results build confidence
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-primary" />
            Consensus: Repeated Results Build Confidence
          </DialogTitle>
          <DialogDescription className="text-base">
            Why multiple independent studies reaching the same conclusion provides stronger evidence
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              When findings are confirmed through independent experiments, it demonstrates that the results are consistent, and not due to chance or specific conditions. Reproducible outcomes across different studies and research groups provide stronger evidence and validation for the results.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchConsensusCard;
