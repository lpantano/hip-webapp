import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const SampleSizeCard = () => {
  const [sampleSizeOpen, setSampleSizeOpen] = React.useState(false);

  return (
    <Dialog open={sampleSizeOpen} onOpenChange={setSampleSizeOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-xl">Sample Size</div>
          </CardHeader>
          <CardContent className="text-center">
            <div>Why study size matters</div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-primary" />
            Why Study Size Matters in Research
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how the number of study participants affects research reliability
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Add detailed content here */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SampleSizeCard;
