import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, MessageSquare, Settings } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: isAdmin = false, isLoading: checkingAdmin } = useQuery({
    queryKey: ['user-admin-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return data || false;
    },
    enabled: !!user
  });

  // Fetch all experts
  const { data: experts = [], isLoading: loadingExperts } = useQuery({
    queryKey: ['admin-experts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experts')
        .select(`
          *,
          profiles!inner(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  // Update expert status
  const updateExpertStatus = async (expertId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('experts')
        .update({ status })
        .eq('id', expertId);

      if (error) throw error;

      toast.success("Status updated", {
        description: `Expert status has been updated to ${status}.`
      });

      queryClient.invalidateQueries({ queryKey: ['admin-experts'] });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update expert status. Please try again."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Show loading state while checking admin status
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
          <div className="text-center">Checking permissions...</div>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform content and user permissions.
          </p>
        </div>

        <Tabs defaultValue="experts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="experts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Experts
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expert Applications</CardTitle>
                <p className="text-muted-foreground">
                  Review and manage expert application statuses.
                </p>
              </CardHeader>
              <CardContent>
                {loadingExperts ? (
                  <div className="text-center py-8">Loading experts...</div>
                ) : experts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No expert applications found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Expertise Area</TableHead>
                          <TableHead>Years of Experience</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {experts.map((expert) => (
                          <TableRow key={expert.id}>
                             <TableCell className="font-medium">
                               <div className="flex items-center gap-3">
                                 {expert.profiles?.avatar_url && (
                                   <img 
                                     src={expert.profiles.avatar_url} 
                                     alt={expert.profiles?.display_name || 'Expert'} 
                                     className="w-8 h-8 rounded-full"
                                   />
                                 )}
                                 <div>
                                   <div className="font-medium">
                                     {expert.profiles?.display_name || 'N/A'}
                                   </div>
                                   <div className="text-sm text-muted-foreground">
                                     {expert.location}
                                   </div>
                                 </div>
                               </div>
                             </TableCell>
                            <TableCell>{expert.expertise_text}</TableCell>
                            <TableCell>{expert.years_of_experience} years</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(expert.status || 'pending')}>
                                {expert.status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {expert.created_at ? new Date(expert.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={expert.status || 'pending'} 
                                onValueChange={(value) => updateExpertStatus(expert.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="accepted">Accept</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims Management</CardTitle>
                <p className="text-muted-foreground">
                  Review and moderate user-submitted claims.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Claims management functionality coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Requests</CardTitle>
                <p className="text-muted-foreground">
                  Manage feature request statuses and priorities.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Feature request management functionality coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <p className="text-muted-foreground">
                  Configure platform-wide settings and preferences.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Platform settings functionality coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;