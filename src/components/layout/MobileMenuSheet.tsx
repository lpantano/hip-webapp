import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Layers, Users, Info, User, LogOut, Shield, Scale, Zap, Award } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { OptimizedAvatar } from '@/components/ui/optimized-avatar';
import ExpertOnboardingDialog from '@/components/forms/ExpertOnboardingDialog';
import CommunityApplicationForm from '@/components/forms/CommunityApplicationForm';

const navLinks = [
  { to: '/', icon: Home, label: 'Health Claims' },
  { to: '/project', icon: Layers, label: 'The Project' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/about', icon: Info, label: 'About' },
];

const rowClass = 'flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-muted transition-colors w-full text-left';

const MobileMenuSheet = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExpertForm, setShowExpertForm] = useState(false);

  const close = () => setOpen(false);

  const { data: isAdmin = false } = useQuery({
    queryKey: ['user-admin-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return data || false;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

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

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 rounded-full">
            {user && profile ? (
              <OptimizedAvatar
                userId={user.id}
                src={avatarUrl}
                alt={displayName}
                fallback={initials}
                size="sm"
              />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto p-0">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* User identity */}
          {user && profile ? (
            <div className="flex items-center gap-3 px-6 py-3">
              <OptimizedAvatar
                userId={user.id}
                src={avatarUrl}
                alt={displayName}
                fallback={initials}
                size="md"
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-3">
              <Button asChild className="w-full" onClick={close}>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Primary navigation */}
          <nav className="py-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={close} className={rowClass}>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Account links — authenticated only */}
          {user && (
            <>
              <Separator />
              <nav className="py-1">
                <Link to="/profile" onClick={close} className={rowClass}>
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  Profile
                </Link>
                <Link to="/features" onClick={close} className={rowClass}>
                  <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  Features
                </Link>
                <Link to="/legal" onClick={close} className={rowClass}>
                  <Scale className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  Legal
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={close} className={rowClass}>
                    <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    Admin Dashboard
                  </Link>
                )}
                {!isExpertOrResearcher && (
                  <button
                    className={rowClass}
                    onClick={() => { close(); setShowOnboarding(true); }}
                  >
                    <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    Apply as Expert
                  </button>
                )}
              </nav>
            </>
          )}

          <Separator />

          {/* Social links */}
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Follow us</p>
            <div className="flex gap-5">
              <a
                href="https://www.linkedin.com/company/health-integrity-project"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={close}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/health.integrity.project"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={close}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Sign out */}
          {user && (
            <>
              <Separator />
              <div className="px-4 py-3 pb-6">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => { signOut(); close(); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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

export default MobileMenuSheet;
