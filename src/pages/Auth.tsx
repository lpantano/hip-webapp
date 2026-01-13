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
import { Mail, Link as LinkIcon, Home } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithMagicLink, user } = useAuth();
  const [showLegalSummary, setShowLegalSummary] = useState(false);
  const [summaryIndex, setSummaryIndex] = useState(0);
  // Welcome dialog shown the first time the user attempts to sign up
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(1);
  const [welcomeAccepted, setWelcomeAccepted] = useState(false);
  // Track current tab so we can show the welcome dialog when switching to Sign Up
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const summaries = [
    {
      title: 'Platform Purpose',
      text: 'We bridge science and public understanding of health information, with a focus on women\'s health. Our goal is transparency, clarity, and building trust through evidence-based content.'
    },
    {
      title: 'Data & Privacy',
      text: 'We collect minimal data (email for regular users). We do NOT sell or rent your information. Experts provide additional credentials for verification. You must be 16+ to use our services.'
    },
    {
      title: 'User Responsibilities',
      text: 'Use the platform respectfully. Content is educational only—not a substitute for professional medical advice. Consult healthcare professionals for medical concerns.'
    },
    {
      title: 'Data Usage & Third Parties',
      text: 'We share minimal data with trusted services (Supabase, Google Auth, Netlify, Zoho) only as needed to operate the site. We use only essential cookies for authentication.'
    },
    {
      title: 'Your Rights',
      text: 'You can access, correct, or delete your data anytime. Request portable data format. Opt out of non-essential communications. Contact us at legal@healthintegrityproject.org'
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
      navigate('/claims');
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

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Email required', {
        description: 'Please enter your email address to receive a magic link.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
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
            
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs value={authTab} onValueChange={(v) => {
            // v has type string from the Tabs component; narrow to our union
            const val = v as 'signin' | 'signup';
            setAuthTab(val);
            if (val === 'signup' && !welcomeAccepted) {
              setWelcomeStep(1);
              setShowWelcomeDialog(true);
            }
          }} className="w-full">
            <CardHeader className="space-y-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-4">
              {authTab === 'signup' && (
                <div className="space-y-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <input
                      id="signup-age"
                      type="checkbox"
                      checked={acceptedAge}
                      onChange={(e) => setAcceptedAge(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
                    />
                    <label htmlFor="signup-age" className="text-sm text-muted-foreground">
                      I confirm that I am at least 16 years old.
                    </label>
                  </div>

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
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isLoading || (authTab === 'signup' && (!acceptedTerms || !acceptedAge))}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              {authTab === 'signup' && (!acceptedTerms || !acceptedAge) && (
                <p className="text-xs text-muted-foreground mt-2">Please confirm your age and accept the Terms and Privacy Policy above before creating an account.</p>
              )}

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

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !email || !password}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleMagicLink}
                      disabled={isLoading || !email}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
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



                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !email || !password || !acceptedTerms || !acceptedAge}
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
        {/* Two-step welcome dialog shown before first sign-up */}
        <Dialog open={showWelcomeDialog} onOpenChange={(v) => { setShowWelcomeDialog(v); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Welcome — why we started</DialogTitle>
              <DialogDescription>
                A short introduction to our purpose. Read through and press "Start sign up" when you're ready.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {welcomeStep === 1 ? (
                <div>
                  <p className="text-sm text-muted-foreground">
                    We started this project to help people <strong>understand the scientific evidence</strong> behind health information they encounter in the media. Our aim is <strong>clarity and transparency</strong>: to build a <strong>bridge between the public and the scientific process</strong> so people can find information they can <strong>trust</strong>.
                  </p>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="ghost" onClick={() => setShowWelcomeDialog(false)}>Back</Button>
                    <Button onClick={() => setWelcomeStep(2)}>Continue</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-semibold">Our approach</h3>
                  <div className="mt-2 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Science is a communal, iterative method</strong> — powerful but complex. When information doesn’t align with our methods, <strong>we don’t aim to shame or blame</strong>. Instead, we <strong>explain, learn, and improve together</strong>.
                    </p>

                    <p className="text-sm text-muted-foreground">
                      We prioritize <strong>clarity, transparency, and a community-first mindset</strong>. We welcome <strong>feedback, corrections, and collaboration</strong> from both community members and experts. Your input helps us be more accurate and more useful.
                    </p>

                    <p className="text-sm text-muted-foreground">
                      <strong>Thank you for joining us</strong> — together we can make <strong>trustworthy</strong> health information easier to understand. If you'd like to reach out, email us at <a href="mailto:hello@healthintegrityproject.org" className="underline text-primary">hello@healthintegrityproject.org</a>.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <Button variant="ghost" onClick={() => setWelcomeStep(1)}>Back</Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setShowWelcomeDialog(false)}>Close</Button>
                      <Button onClick={async () => {
                        // mark as accepted for this session and proceed with signup
                        setWelcomeAccepted(true);
                        setShowWelcomeDialog(false);
                        // Trigger signup using existing form values
                        await handleEmailAuth(true);
                      }}>
                        Start sign up
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Continue without signing in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
