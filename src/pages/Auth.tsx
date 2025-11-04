import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Mail } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const [showLegalSummary, setShowLegalSummary] = useState(false);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const summaries = [
    {
      title: 'Platform Purpose',
      text: 'We provide research-backed insights focused on women\'s health and empowerment — bridging scientific research to practical, evidence-based guidance.'
    },
    {
      title: 'Data & Usage',
      text: 'We collect minimal data (email, usage analytics, preferences) to provide and improve services. Data is encrypted and used for personalization and communication.'
    },
    {
      title: 'User Responsibilities',
      text: 'Use the platform respectfully. Research summaries are educational and not a substitute for professional medical or psychological advice.'
    },
    {
      title: 'Limits & Updates',
      text: 'Content is educational only; we are not liable for individual outcomes. Terms and policies may change; continued use means acceptance.'
    },
    {
      title: 'Your Rights',
      text: 'You can access, correct, or delete your data, opt out of non-essential messages, and request your data in a portable format.'
    }
  ];

  const nextSummary = () => setSummaryIndex((i) => Math.min(i + 1, summaries.length - 1));
  const prevSummary = () => setSummaryIndex((i) => Math.max(i - 1, 0));
  const acceptAndClose = () => {
    setAcceptedTerms(true);
    setShowLegalSummary(false);
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80">
            Health Integrity Project
          </Link>
            <p className="text-lg text-muted-foreground">
              We’re building something great — the platform is under active development and open by invitation only.
              <br />
              <Link to="/#mailing-list" className="underline ml-1">Join our mailing list</Link> to get updates and an invitation when spots open.
            </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="space-y-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <TabsContent value="signin" className="space-y-4 mt-4">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to access your account and continue your journey
                </CardDescription>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleEmailAuth(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !email || !password}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>
                  Join thousands of women making informed health decisions
                </CardDescription>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleEmailAuth(true);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <input
                        id="signup-terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
                      />
                      <label htmlFor="signup-terms" className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <Link to="/legal" className="underline text-primary hover:text-primary/80">
                          terms of service
                        </Link>{' '}
                        and{' '}
                        <Link to="/legal" className="underline text-primary hover:text-primary/80">
                          privacy policy
                        </Link>
                        .
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 ml-6 text-sm text-muted-foreground">
                      <span>Review the short version in <strong>30 seconds</strong></span>
                      <Button size="sm" variant="outline" onClick={() => { setShowLegalSummary(true); setSummaryIndex(0); }}>
                        Quick summary
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !email || !password || !acceptedTerms}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter />
          </Tabs>
        </Card>
        {/* Quick legal summary dialog (5 cards, ~30s read) */}
        <Dialog open={showLegalSummary} onOpenChange={(v) => { setShowLegalSummary(v); if (v) setSummaryIndex(0); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Quick legal summary — 30s</DialogTitle>
              <DialogDescription>Tap through five short cards summarizing our Terms and Privacy.</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{summaries[summaryIndex].title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{summaries[summaryIndex].text}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={prevSummary} disabled={summaryIndex === 0}>Prev</Button>
                    <Button size="sm" variant="ghost" onClick={nextSummary} disabled={summaryIndex === summaries.length - 1}>Next</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {summaryIndex === summaries.length - 1 ? (
                      <Button size="sm" onClick={acceptAndClose}>Accept & Close</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setSummaryIndex(summaryIndex + 1)}>Continue</Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;
