import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, Plus, MessageSquare } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import FeatureRequestForm from '@/components/forms/FeatureRequestForm';

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  planned: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const FeatureRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<"votes" | "recent" | "comments">("votes");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNewRequest, setShowNewRequest] = useState(false);

  // Fetch feature requests
  const { data: featureRequests = [], isLoading } = useQuery({
    queryKey: ['feature-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_requests_full')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Check if user has voted on a feature
  const { data: userVotes = [] } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('feature_votes')
        .select('feature_request_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(vote => vote.feature_request_id) || [];
    },
    enabled: !!user
  });

  // Check if user is an expert
  const { data: isExpert = false } = useQuery({
    queryKey: ['user-expert-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'expert' });
      return data || false;
    },
    enabled: !!user
  });

  const handleVote = async (requestId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to be signed in to vote on features.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already voted
      if (userVotes.includes(requestId)) {
        // Remove vote
        const { error } = await supabase
          .from('feature_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('feature_request_id', requestId);
        
        if (error) throw error;
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed."
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from('feature_votes')
          .insert({
            user_id: user.id,
            feature_request_id: requestId,
            is_expert: isExpert
          });
        
        if (error) throw error;
        
        toast({
          title: "Vote added",
          description: "Thank you for voting!"
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = featureRequests.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "votes") return (b.total_votes || 0) - (a.total_votes || 0);
    if (sortBy === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "comments") return (b.comments_count || 0) - (a.comments_count || 0);
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
          <div className="text-center">Loading feature requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Feature Requests</h1>
            <p className="text-muted-foreground">
              Suggest and vote on new features for the platform. Only members can vote.
            </p>
          </div>
          <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FeatureRequestForm onSuccess={() => { setShowNewRequest(false); queryClient.invalidateQueries({ queryKey: ['feature-requests'] }); }} onCancel={() => setShowNewRequest(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "votes" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("votes")}
            >
              Most Votes
            </Button>
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "comments" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("comments")}
            >
              Most Discussed
            </Button>
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("open")}
            >
              Open
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("in_progress")}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {sortedRequests.map((request) => {
            const hasVoted = userVotes.includes(request.id);
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                          {request.status.replace("_", " ")}
                        </Badge>
                        <Badge className={priorityColors[request.priority as keyof typeof priorityColors]}>
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{request.description}</p>
                      <div className="flex gap-1 flex-wrap">
                        {request.labels?.map((label: string) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Single upvote button */}
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={hasVoted ? "default" : "outline"}
                          className="h-10 px-3 flex items-center gap-2"
                          onClick={() => handleVote(request.id)}
                          disabled={!user}
                        >
                          <ArrowUp className={`h-4 w-4 ${hasVoted ? 'text-white' : ''}`} />
                          {hasVoted ? 'Voted' : 'Upvote'}
                        </Button>
                        
                        {/* Vote counts display */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{request.member_votes || 0}</div>
                            <div className="text-xs text-muted-foreground">Members</div>
                          </div>
                          
                          <Separator orientation="vertical" className="h-8" />
                          
                          <div className="text-center">
                            <div className="font-medium">{request.expert_votes || 0}</div>
                            <div className="text-xs text-muted-foreground">Experts</div>
                          </div>
                        </div>
                      </div>

                      {!user && (
                        <>
                          <Separator orientation="vertical" className="h-10" />
                          <Button size="sm" variant="outline" className="text-xs">
                            Sign in to vote
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{request.comments_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureRequests;