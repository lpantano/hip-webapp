import { User, LogOut, Settings, Shield, Scale, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { OptimizedAvatar } from '@/components/ui/optimized-avatar';
import { useState } from 'react';
import ExpertOnboardingDialog from '@/components/forms/ExpertOnboardingDialog';
import CommunityApplicationForm from '@/components/forms/CommunityApplicationForm';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExpertForm, setShowExpertForm] = useState(false);

  // Check if user is admin
  const { data: isAdmin = false } = useQuery({
    queryKey: ['user-admin-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return data || false;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Check if user is already an expert or researcher
  const { data: isExpertOrResearcher = false } = useQuery({
    queryKey: ['user-expert-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const [{ data: expertData }, { data: researcherData }] = await Promise.all([
        supabase.rpc('has_role', { _user_id: user.id, _role: 'expert' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'researcher' }),
      ]);
      return (expertData || researcherData) || false;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch user profile data including uploaded avatar
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
    // Cache the profile briefly and avoid refetch on focus/mount to prevent extra renders
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (!profile) return null;
  // console.log('UserMenu render for user:',profile);
  // Prioritize profile data over OAuth metadata
  const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url; // Profile avatar takes priority
  const initials = displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <OptimizedAvatar
            userId={user.id}
            src={avatarUrl}
            alt={displayName}
            fallback={initials}
            size="md"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/legal')}>
          <Scale className="mr-2 h-4 w-4" />
          <span>Legal</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/features')}>
          <Zap className="mr-2 h-4 w-4" />
          <span>Features</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        {!isExpertOrResearcher && (
          <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
            <Award className="mr-2 h-4 w-4" />
            <span>Apply as Expert</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ExpertOnboardingDialog
      open={showOnboarding}
      onOpenChange={setShowOnboarding}
      onApply={() => setShowExpertForm(true)}
    />
    <CommunityApplicationForm
      open={showExpertForm}
      onOpenChange={setShowExpertForm}
      memberType="expert"
    />
    </>
  );
};

export default UserMenu;
