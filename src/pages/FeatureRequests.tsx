import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, Plus, MessageSquare } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

const mockFeatureRequests = [
  {
    id: 1,
    title: "Advanced Search Filters",
    description: "Add ability to filter claims by date range, expert level, and topic categories to help users find relevant information faster.",
    status: "under_review",
    priority: "high",
    labels: ["enhancement", "search", "ux"],
    userVotes: 45,
    expertVotes: 12,
    comments: 8,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Mobile App Support",
    description: "Develop native mobile applications for iOS and Android to provide better accessibility and push notifications.",
    status: "planned",
    priority: "medium",
    labels: ["feature", "mobile", "accessibility"],
    userVotes: 89,
    expertVotes: 23,
    comments: 15,
    createdAt: "2024-01-12"
  },
  {
    id: 3,
    title: "Expert Verification System",
    description: "Implement a more robust verification process for experts including credential validation and peer review.",
    status: "in_progress",
    priority: "critical",
    labels: ["security", "verification", "experts"],
    userVotes: 67,
    expertVotes: 34,
    comments: 22,
    createdAt: "2024-01-10"
  },
  {
    id: 4,
    title: "Dark Mode Theme",
    description: "Add a dark mode option for better user experience during night time usage and reduced eye strain.",
    status: "completed",
    priority: "low",
    labels: ["ui", "theme", "accessibility"],
    userVotes: 156,
    expertVotes: 8,
    comments: 31,
    createdAt: "2024-01-08"
  },
  {
    id: 5,
    title: "Bulk Import Claims",
    description: "Allow administrators to import multiple claims from CSV or JSON files for easier data migration.",
    status: "rejected",
    priority: "medium",
    labels: ["admin", "import", "data"],
    userVotes: 23,
    expertVotes: 5,
    comments: 12,
    createdAt: "2024-01-05"
  }
];

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
  const [sortBy, setSortBy] = useState<"votes" | "recent" | "comments">("votes");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleVote = (requestId: number, voteType: "up" | "down", voterType: "user" | "expert") => {
    if (!user) return;
    // This would update votes in the database
    console.log(`Voting ${voteType} on request ${requestId} as ${voterType}`);
  };

  const filteredRequests = mockFeatureRequests.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "votes") return (b.userVotes + b.expertVotes) - (a.userVotes + a.expertVotes);
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "comments") return b.comments - a.comments;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Feature Requests</h1>
            <p className="text-muted-foreground">
              Suggest and vote on new features for the platform. Only members can vote.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
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
          {sortedRequests.map((request) => (
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
                      {request.labels.map((label) => (
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
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleVote(request.id, "up", "user")}
                          disabled={!user}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleVote(request.id, "down", "user")}
                          disabled={!user}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{request.userVotes}</div>
                        <div className="text-xs text-muted-foreground">Users</div>
                      </div>
                    </div>
                    
                    <Separator orientation="vertical" className="h-12" />
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleVote(request.id, "up", "expert")}
                          disabled={!user}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleVote(request.id, "down", "expert")}
                          disabled={!user}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{request.expertVotes}</div>
                        <div className="text-xs text-muted-foreground">Experts</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{request.comments}</span>
                  </div>
                </div>
                
                {!user && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">
                      Sign in to vote on feature requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureRequests;