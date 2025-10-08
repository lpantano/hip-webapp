import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResourceSubmissionForm } from "@/components/forms/ResourceSubmissionForm";
import { ResourceList } from "@/components/resources/ResourceList";
import { useAuth } from "@/hooks/useAuth";

export const ResourcesSection = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trusted Resources</h2>
          <p className="text-muted-foreground">
            Evidence-based resources vetted by our expert community
          </p>
        </div>
        
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit New Resource</DialogTitle>
              </DialogHeader>
              <ResourceSubmissionForm onSuccess={() => window.location.reload()} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Criteria Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              Expert Panel Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every resource undergoes rigorous evaluation by verified experts in the relevant field.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              Evidence-Based Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Resources must demonstrate systematic evidence review, peer review, or established clinical guidelines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              Independent Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We verify authorship, check for conflicts of interest, and ensure resources come from reputable sources.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Lists */}
      <Tabs defaultValue="trusted" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trusted">Trusted</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="waiting_decision">Waiting Decision</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trusted" className="mt-6">
          <ResourceList status="trusted" />
        </TabsContent>
        
        <TabsContent value="under_review" className="mt-6">
          <ResourceList status="under_review" />
        </TabsContent>
        
        <TabsContent value="waiting_decision" className="mt-6">
          <ResourceList status="waiting_decision" />
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <ResourceList status="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
};