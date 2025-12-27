import { useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handles server-side errors returned via URL redirect (OAuth or password login)
    const handleAuthErrorRedirect = () => {
      try {
        // Check for generic error parameters in URL (common OAuth error pattern)
        const rawSearch = window.location.search || '';
        const rawHash = window.location.hash || '';
        const urlParams = new URLSearchParams(rawSearch);
        const fragmentParams = new URLSearchParams(rawHash.replace(/^#/, ''));

        // Check for standard error parameters
        const errorParam = urlParams.get('error') || fragmentParams.get('error');
        const errorDescription = urlParams.get('error_description') || fragmentParams.get('error_description');

        if (errorParam || errorDescription) {
          // Display generic error message
          toast.error('Authentication Error', {
            description: errorDescription || errorParam || 'An error occurred during authentication.',
          });

          // Clean up the URL to prevent the toast on subsequent refreshes
          try {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e) {
            // ignore
          }

          return true; // Error was handled
        }
      } catch (e) {
        // swallow and continue
        logger.info('handleAuthErrorRedirect failed', e);
      }
      return false; // No relevant error found
    };

    // 1. Handle errors that may exist in the URL from a failed OAuth or password login
    const isErrorHandled = handleAuthErrorRedirect();

    // Also listen for hash/popstate changes in case the redirect updates the URL after mount
    const onUrlChange = () => handleAuthErrorRedirect();
    window.addEventListener('hashchange', onUrlChange);
    window.addEventListener('popstate', onUrlChange);

    // 2. Set up auth state listener (fires immediately with current session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.log('[Auth] State change event:', event, session ? 'with session' : 'no session');

        // Log token refresh attempts and failures
        if (event === 'TOKEN_REFRESHED') {
          logger.log('✅ Auth token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          logger.log('⚠️ User signed out (could be automatic due to token expiry)');
        } else if (event === 'USER_UPDATED') {
          logger.log('ℹ️ User data updated');
        } else if (event === 'SIGNED_IN') {
          logger.log('✅ User signed in');
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Only stop loading here if no error was immediately handled
        if (!isErrorHandled) {
          setLoading(false);
        }
      }
    );

    // 3. Optionally verify session with server (more secure than getSession)
    // This validates the session server-side but doesn't read from local storage
    // Note: onAuthStateChange already fires immediately with current session,
    // so this is just an extra verification step
    supabase.auth.getUser()
      .then(({ data: { user: authUser }, error }) => {
        if (error) {
          logger.error('[Auth] Error verifying user session:', error);
          // onAuthStateChange will handle clearing state if needed
        } else if (authUser) {
          logger.log('[Auth] User session verified via getUser:', {
            userId: authUser.id,
            email: authUser.email
          });
          // Session is verified - onAuthStateChange already handled setting state
        }
        // Ensure loading stops (onAuthStateChange also handles this, but this is a fallback)
        setLoading(false);
      })
      .catch((error) => {
        logger.error('[Auth] Error in getUser verification:', error);
        // onAuthStateChange will handle state, just ensure loading stops
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', onUrlChange);
      window.removeEventListener('popstate', onUrlChange);
    };
  }, []); // No dependencies needed

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Sign In Error', {
        description: error.message,
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Use window.location.origin to preserve the current domain (devel vs production)
    const redirectUrl = `${window.location.origin}/claims`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast.error('Sign Up Error', {
        description: error.message,
      });
    } else {
      toast.success('Check your email', {
        description: "We've sent you a confirmation link to complete your registration.",
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    // Note: error object here is only returned if the initial redirect fails
    // The server-side error is handled in useEffect via URL parsing.
    // Use window.location.origin to preserve the current domain (devel vs production)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/claims`
      }
    });

    if (error) {
      toast.error("Google Sign In Error", {
        description: error.message,
      });
    }

    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    // Use window.location.origin to preserve the current domain (devel vs production)
    const redirectUrl = `${window.location.origin}/claims`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error('Magic Link Error', {
        description: error.message,
      });
    } else {
      toast.success('Check your email', {
        description: "We've sent you a magic link to sign in. Click the link in your email to continue.",
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) {
      toast.error('Password Update Error', {
        description: 'User not found.',
      });
      return { error: { message: 'User not found' } as AuthError };
    }

    // Update the password directly (no current password verification needed)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error('Password Update Error', {
        description: error.message || 'Failed to update password. Please try again.',
      });
    } else {
      toast.success('Password Updated', {
        description: 'Your password has been successfully updated.',
      });
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    // Use resetPasswordForEmail which sends a password reset link
    // The link will redirect to /reset-password page with token_hash in the URL
    // Use window.location.origin to preserve the current domain (devel vs production)
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast.error('Password Reset Error', {
        description: error.message,
      });
    } else {
      toast.success('Reset link sent', {
        description: "We've sent a password reset link to your email. Click the link to reset your password.",
      });
    }

    return { error };
  };


  const hasPasswordAuth = (): boolean => {
    if (!user) return false;

    // Check if user has email identity with email provider (password-based auth)
    // Users with OAuth-only won't have this identity
    const hasEmailIdentity = user.identities?.some(
      (identity) => identity.provider === 'email'
    );

    return hasEmailIdentity || false;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign Out Error", {
        description: error.message,
      });
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
    updatePassword,
    resetPassword,
    hasPasswordAuth,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
