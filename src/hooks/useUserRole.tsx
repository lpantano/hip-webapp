import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Development role override - set this to test different roles locally
const getDevRoleOverride = (): AppRole[] | null => {
  if (import.meta.env.MODE !== 'development') return null;
  
  // Check localStorage first (for DevRoleSelector component)
  if (typeof window !== 'undefined') {
    const localStorageRoles = localStorage.getItem('DEV_USER_ROLES');
    if (localStorageRoles) {
      return localStorageRoles.split(',') as AppRole[];
    }
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_DEV_USER_ROLES?.split(',') as AppRole[] || null;
};

export const useUserRole = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRoles = async () => {
      // Development override for testing
      const devRoleOverride = getDevRoleOverride();
      if (devRoleOverride && import.meta.env.MODE === 'development') {
        console.log('🚀 [DEV] Using overridden roles:', devRoleOverride);
        setRoles(devRoleOverride);
        setLoading(false);
        return;
      }

      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch all roles for the user
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(row => row.role) || [];
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isExpert = hasRole('expert');
  const isResearcher = hasRole('researcher');
  const isExpertOrResearcher = isExpert || isResearcher;
  const isAdmin = hasRole('admin');
  const isUser = hasRole('user');

  return {
    roles,
    loading,
    hasRole,
    isExpert,
    isResearcher,
    isExpertOrResearcher,
    isAdmin,
    isUser
  };
};