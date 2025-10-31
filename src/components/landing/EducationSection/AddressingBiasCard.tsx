import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Filter } from 'lucide-react';

const AddressingBiasCard = () => {
  const [biasOpen, setBiasOpen] = React.useState(false);

  return (
    <Dialog open={biasOpen} onOpenChange={setBiasOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Addressing Bias</CardTitle>
            <CardDescription className="text-base font-medium">
              Clear the noise to see the signal
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Filter className="w-6 h-6 text-primary" />
            Addressing Bias: Clear the Noise to See the Signal
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how researchers identify and control for confounding variables to reduce bias
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Introduction */}
          <div>
            <p className="text-muted-foreground">
              Human studies are complex. Differences in age, background, and other factors can influence results, so careful design and proper analysis are key. By identifying and controlling for confounding variables, researchers can reduce bias and build stronger, more trustworthy conclusions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressingBiasCard;
