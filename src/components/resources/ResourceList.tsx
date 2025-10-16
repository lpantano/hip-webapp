import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  reviewer?: {
    display_name: string | null;
    cached_avatar_url: string | null;
  };
}

interface ResourceListProps {
  status: 'waiting_decision' | 'under_review' | 'trusted' | 'all';
}

export const ResourceList = ({ status }: ResourceListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isExpertOrResearcher, setIsExpertOrResearcher] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("resources").select("*");
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch reviews for each resource with reviewer information
      if (data) {
        const resourcesWithReviews = await Promise.all(
          data.map(async (resource) => {
            // Fetch reviews
            const { data: reviews } = await supabase
              .from("resource_reviews")
              .select("*")
              .eq("resource_id", resource.id);

            // For each review, fetch the reviewer's profile
            const reviewsWithProfiles = await Promise.all(
              (reviews || []).map(async (review) => {
                const { data: profiles, error: profileError } = await supabase
                  .from("profiles")
                  .select("display_name, cached_avatar_url")
                  .eq("user_id", review.reviewer_user_id);

                if (profileError) {
                  console.error("Error fetching profile for review:", review.id, profileError);
                }

                const profile = profiles && profiles.length > 0 ? profiles[0] : null;

                // Use display_name if available, otherwise show a truncated user ID
                const displayName = profile?.display_name || `User ${review.reviewer_user_id.slice(0, 8)}`;

                return {
                  ...review,
                  reviewer: {
                    display_name: displayName,
                    cached_avatar_url: profile?.cached_avatar_url || null
                  }
                };
              })
            );

            return { ...resource, reviews: reviewsWithProfiles };
          })
        );
        setResources(resourcesWithReviews);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "Failed to fetch resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    fetchResources();
  }, [status, fetchResources]);

  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpertOrResearcher(false);
        return;
      }
      
      try {
        // Check if user has expert or researcher role
        const { data: expertData } = await supabase.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'expert' 
        });
        
        const { data: researcherData } = await supabase.rpc('has_role', { 
          _user_id: user.id, 
          _role: 'researcher' 
        });
        
        setIsExpertOrResearcher((expertData || false) || (researcherData || false));
      } catch (error) {
        console.error('Error checking expert/researcher status:', error);
        setIsExpertOrResearcher(false);
      }
    };

    checkExpertStatus();
  }, [user]);

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
    // Only allow reviews for resources that are under_review
    return user && resource.status === 'under_review' && isExpertOrResearcher && !resource.reviews?.some(review => review.reviewer_user_id === user.id);
  };

  const approveForReview = async (resourceId: string) => {
    if (!user || !isExpertOrResearcher) return;
    
    try {
      const { error } = await supabase
        .from('resources')
        .update({ status: 'under_review' })
        .eq('id', resourceId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Resource approved for review. It will now be available for expert evaluation.",
      });
      
      // Refresh the resources list
      fetchResources();
    } catch (error) {
      console.error('Error approving resource for review:', error);
      toast({
        title: "Error",
        description: "Failed to approve resource. Please try again.",
        variant: "destructive",
      });
    }
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
                {/* Approve for Review button for waiting_decision resources */}
                {resource.status === 'waiting_decision' && isExpertOrResearcher && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => approveForReview(resource.id)}
                  >
                    Approve for Review
                  </Button>
                )}
                
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
                        {resource.reviews.map((review) => {
                          const reviewerName = review.reviewer?.display_name || 'Anonymous';
                          const reviewerInitials = reviewerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                          return (
                            <div key={review.id} className="p-3 rounded-lg border">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  {review.reviewer?.cached_avatar_url && (
                                    <AvatarImage src={review.reviewer.cached_avatar_url} alt={reviewerName} />
                                  )}
                                  <AvatarFallback>{reviewerInitials}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
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

                                  <p className="text-sm font-medium mb-1">{reviewerName}</p>

                                  {review.comments && (
                                    <p className="text-sm text-muted-foreground">{review.comments}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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