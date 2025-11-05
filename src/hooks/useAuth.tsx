import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast, toast as globalToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// Define your custom error message part from the PostgreSQL trigger
const CUSTOM_WHITELIST_ERROR_KEY = 'Signup not allowed';
const CUSTOM_TOAST_MESSAGE = 'Access is by invitation while the platform is in development. Subscribe to our mailing list to get updates and an invitation.';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {

    // Handles server-side errors returned via URL redirect (OAuth or password login)
    const handleAuthErrorRedirect = () => {
      try {
        // Raw full href (includes query and fragment). Useful because some providers encode errors in different places.
        const href = window.location.href || '';
        const hrefDecoded = decodeURIComponent(href || '').toLowerCase();

        // Also inspect raw search and hash strings and params separately
        const rawSearch = window.location.search || '';
        const rawHash = window.location.hash || '';
        const urlParams = new URLSearchParams(rawSearch);
        const fragmentParams = new URLSearchParams(rawHash.replace(/^#/, ''));

        // Build a list of strings to inspect
        const allEntries: Array<string> = [hrefDecoded, rawSearch.toLowerCase(), rawHash.toLowerCase()];
        for (const [k, v] of urlParams.entries()) {
          allEntries.push(k.toLowerCase());
          if (v) allEntries.push(decodeURIComponent(v).toLowerCase());
          allEntries.push(v.toLowerCase());
        }
        for (const [k, v] of fragmentParams.entries()) {
          allEntries.push(k.toLowerCase());
          if (v) allEntries.push(decodeURIComponent(v).toLowerCase());
          allEntries.push(v.toLowerCase());
        }

        const needle = CUSTOM_WHITELIST_ERROR_KEY.toLowerCase();

        // Also check more relaxed variants to be robust
        const relaxedNeedles = [needle, 'not allowed', 'whitelist', 'signup not allowed', 'signup_not_allowed'];

        const found = allEntries.some((s) => {
          if (!s) return false;
          return relaxedNeedles.some((n) => s.includes(n));
        });

        // Debug logs to help you inspect in the browser console
        // console.info('[Auth] URL inspection for whitelist error', { href, rawSearch, rawHash, found });

        if (found) {
          // Display the user-friendly message using module-level toast to avoid timing issues
            globalToast({
              title: 'Working to open the platform to everybody.',
              description: CUSTOM_TOAST_MESSAGE,
              variant: 'destructive',
            });

          // Clean up the URL to prevent the toast on subsequent refreshes
          try {
            const cleanUrl = window.location.pathname + window.location.search.replace(/([#].*)$/, '');
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

    // 2. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Only stop loading here if no error was immediately handled
        if (!isErrorHandled) {
            setLoading(false);
        }
      }
    );

    // 3. THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Ensure loading is false after checking session
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', onUrlChange);
      window.removeEventListener('popstate', onUrlChange);
    };
  }, [toast]); // Dependencies for toast

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check for custom whitelist error
      const description = error.message.includes(CUSTOM_WHITELIST_ERROR_KEY)
        ? CUSTOM_TOAST_MESSAGE
        : error.message;

      // Use local toast if available; fallback to module-level toast
      try {
        toast({
          title: 'Sign In Error',
          description,
          variant: 'destructive',
        });
      } catch (e) {
        globalToast({
          title: 'Sign In Error',
          description,
          variant: 'destructive',
        });
      }
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      // 💡 NEW: Check for the custom whitelist error in the direct API response
      const description = error.message.includes(CUSTOM_WHITELIST_ERROR_KEY)
        ? CUSTOM_TOAST_MESSAGE
        : error.message;

      try {
        toast({
          title: 'Sign Up Error',
          description: description,
          variant: 'destructive',
        });
      } catch (e) {
        globalToast({
          title: 'Sign Up Error',
          description: description,
          variant: 'destructive',
        });
      }
    } else {
      try {
        toast({
          title: 'Check your email',
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } catch (e) {
        globalToast({
          title: 'Check your email',
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    // Note: error object here is only returned if the initial redirect fails
    // The server-side error is handled in useEffect via URL parsing.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Google Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
