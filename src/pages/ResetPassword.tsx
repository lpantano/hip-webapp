import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Extract token from URL - Supabase may have already processed it
    const extractToken = () => {
      try {
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

        // Supabase puts the token in the hash fragment (#), not query parameters
        const hashFragment = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hashFragment);
        const queryParams = new URLSearchParams(window.location.search);
        
        // Try hash first (Supabase default), then query params
        const hash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const type = hashParams.get('type') || queryParams.get('type');

        if (hash && type === 'recovery') {
          setTokenHash(hash);
          // Clean up the URL to remove the token
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else if (user) {
          // If Supabase already processed the token and user is authenticated,
          // we can proceed with password reset (token was already verified)
          setTokenHash('verified'); // Use a marker to indicate token was already verified
        } else {
          // If no valid token and no user, redirect to auth page
          toast.error('Invalid reset link', {
            description: 'This password reset link is invalid or has expired.',
          });
          setTimeout(() => navigate('/auth'), 1500);
        }
      } catch (error) {
        console.error('Error extracting reset token:', error);
        toast.error('Error processing reset link', {
          description: 'Please try requesting a new password reset link.',
        });
        setTimeout(() => navigate('/auth'), 1500);
      } finally {
        setIsInitialized(true);
      }
    };

    // Run immediately
    extractToken();
  }, [navigate, user]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('All fields required', {
        description: 'Please fill in all fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both password fields match.',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (!tokenHash) {
      toast.error('Invalid reset link', {
        description: 'Reset token is missing. Please request a new reset link.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // If tokenHash is 'verified', Supabase already processed the token
      // Otherwise, verify it now
      if (tokenHash !== 'verified') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (verifyError) {
          toast.error('Invalid or expired link', {
            description: verifyError.message || 'This reset link is invalid or has expired. Please request a new one.',
          });
          return;
        }
      }

      // Update the password (user should be authenticated at this point)
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error('Password update failed', {
          description: updateError.message || 'Failed to update password. Please try again.',
        });
        return;
      }

      // Success!
      toast.success('Password reset successful', {
        description: 'Your password has been successfully reset. You can now sign in with your new password.',
      });

      // Redirect to auth page after a short delay
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no token after initialization, show redirect message
  if (!tokenHash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's at least 6 characters long.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Link
                  to="/auth"
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

