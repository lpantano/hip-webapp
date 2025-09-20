import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ResourceReviewForm } from "@/components/forms/ResourceReviewForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Resource {
  id: string;
  name: string;
  url: string;
  expertise_area: string;
  description: string;
  status: string;
  created_at: string;
  reviews?: ResourceReview[];
}

interface ResourceReview {
  id: string;
  supports: boolean;
  comments: string | null;
  created_at: string;
  reviewer_user_id: string;
}

interface ResourceListProps {
  status: 'waiting_decision' | 'under_review' | 'trusted' | 'all';
}

export const ResourceList = ({ status }: ResourceListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchResources = async () => {
    setLoading(true);
    try {
      let query = supabase.from("resources").select("*");
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch reviews for each resource
      if (data) {
        const resourcesWithReviews = await Promise.all(
          data.map(async (resource) => {
            const { data: reviews } = await supabase
              .from("resource_reviews")
              .select("*")
              .eq("resource_id", resource.id);
            
            return { ...resource, reviews: reviews || [] };
          })
        );
        setResources(resourcesWithReviews);
      }
    } catch (error: any) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [status]);

  const getStatusColor = (resourceStatus: string) => {
    switch (resourceStatus) {
      case 'waiting_decision':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'trusted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (resourceStatus: string) => {
    return resourceStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canReview = (resource: Resource) => {
    // Check if user can review (expert, researcher, admin) and hasn't reviewed yet
    return user && !resource.reviews?.some(review => review.reviewer_user_id === user.id);
  };

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No resources found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {resources.map((resource) => {
        const supportCount = resource.reviews?.filter(r => r.supports).length || 0;
        const opposeCount = resource.reviews?.filter(r => !r.supports).length || 0;
        const userReview = resource.reviews?.find(r => r.reviewer_user_id === user?.id);

        return (
          <Card key={resource.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {resource.name}
                    <Badge className={getStatusColor(resource.status)}>
                      {formatStatus(resource.status)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mr-2">
                      {resource.expertise_area.replace('_', ' ')}
                    </Badge>
                    Added {new Date(resource.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{resource.description}</p>
              
              {/* Review Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>{supportCount} Support</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>{opposeCount} Oppose</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{resource.reviews?.filter(r => r.comments).length || 0} Comments</span>
                </div>
              </div>

              {/* User's Review Status */}
              {userReview && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">
                    Your review: {userReview.supports ? "Support" : "Oppose"}
                  </p>
                  {userReview.comments && (
                    <p className="text-sm text-muted-foreground mt-1">{userReview.comments}</p>
                  )}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex gap-2">
                {canReview(resource) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Review Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Resource</DialogTitle>
                      </DialogHeader>
                      <ResourceReviewForm
                        resourceId={resource.id}
                        resourceName={resource.name}
                        onReviewSubmitted={() => {
                          fetchResources();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {/* Show Reviews */}
                {resource.reviews && resource.reviews.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View Reviews ({resource.reviews.length})
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-3">
                        {resource.reviews.map((review) => (
                          <div key={review.id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              {review.supports ? (
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">
                                {review.supports ? "Supports" : "Opposes"}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comments && (
                              <p className="text-sm text-muted-foreground">{review.comments}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};