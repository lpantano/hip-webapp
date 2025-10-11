import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const DEV_ROLES: AppRole[] = ['user', 'expert', 'researcher', 'admin', 'ambassador', 'founding_expert', 'founding_user'];

const DevRoleSelector = () => {
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>(['user']);
  const [isVisible, setIsVisible] = useState(false);
  const { roles: currentRoles, isExpert, isResearcher, isAdmin, isExpertOrResearcher } = useUserRole();

  // Keyboard shortcut to toggle (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Check environment variable OR use keyboard toggle
  const showDevTester = import.meta.env.VITE_SHOW_DEV_ROLE_TESTER === 'true' || isVisible;

  if (!showDevTester) {
    return null;
  }

  const handleRoleToggle = (role: AppRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const applyRoles = () => {
    const rolesString = selectedRoles.join(',');
    console.log('🚀 [DEV] Applying roles:', rolesString);
    
    // Update environment variable (this would require a page refresh to take effect)
    if (typeof window !== 'undefined') {
      localStorage.setItem('DEV_USER_ROLES', rolesString);
      window.location.reload();
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
          🛠️ Dev Role Tester
          <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
          {isVisible && <Badge variant="secondary" className="text-xs">⌨️ TOGGLED</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Current Roles:</p>
          <div className="flex flex-wrap gap-1">
            {currentRoles.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick Status:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>Expert: {isExpert ? '✅' : '❌'}</span>
            <span>Researcher: {isResearcher ? '✅' : '❌'}</span>
            <span>Admin: {isAdmin ? '✅' : '❌'}</span>
            <span>Expert/Researcher: {isExpertOrResearcher ? '✅' : '❌'}</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Test Roles:</p>
          <div className="grid grid-cols-2 gap-1">
            {DEV_ROLES.map(role => (
              <Button
                key={role}
                variant={selectedRoles.includes(role) ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => handleRoleToggle(role)}
              >
                {role}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyRoles} size="sm" className="flex-1">
            Apply & Reload
          </Button>
          {isVisible && (
            <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
              ✕
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Or set VITE_SHOW_DEV_ROLE_TESTER=true in .env.local
          {!isVisible && <br />}
          {!isVisible && "Press Ctrl/⌘ + Shift + D to toggle"}
        </p>
      </CardContent>
    </Card>
  );
};

export default DevRoleSelector;