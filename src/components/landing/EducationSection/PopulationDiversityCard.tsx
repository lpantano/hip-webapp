import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PopulationDiversityCard = () => {
  const [populationOpen, setPopulationOpen] = React.useState(false);

  return (
    <Dialog open={populationOpen} onOpenChange={setPopulationOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Population Representation</CardTitle>
            <CardDescription>
              Why diverse participants matter
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
            <Globe className="w-6 h-6 text-primary" />
            Why Population Representation Matters
          </DialogTitle>
          <DialogDescription className="text-base">
            Understanding how bias in study populations can invalidate research results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Add detailed content here */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopulationDiversityCard;
