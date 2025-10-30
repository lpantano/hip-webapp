import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass } from 'lucide-react';

const StudyDesignCard = () => {
  const [studyDesignOpen, setStudyDesignOpen] = React.useState(false);

  return (
    <Dialog open={studyDesignOpen} onOpenChange={setStudyDesignOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Study Design</CardTitle>
            <CardDescription className="text-base font-medium">
              Careful planning leads to credible results
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Compass className="w-6 h-6 text-primary" />
            Study Design: Careful Planning Leads to Credible Results
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how thoughtful study design increases the reliability of research findings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              Thoughtful consideration when conducting a scientific experiment increases the chances of a reliable result. Balanced cohorts, proper controls, and rigorous quality checks ensure good data. Appropriate statistical models suitable for the design strengthens confidence in the results.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyDesignCard;
