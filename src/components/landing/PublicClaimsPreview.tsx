import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { ClaimCard } from '@/pages/Claims/components/ClaimCard';
import { usePublicClaims } from '@/hooks/usePublicClaims';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/**
 * Public claims preview section for homepage
 * Shows 5 most recent claims with limited interactivity for anonymous users
 */
const PublicClaimsPreview = () => {
  const { claims, expertProfiles, isLoading, error } = usePublicClaims();
  const { user } = useAuth();

  // No-op handlers for anonymous users
  const handleVote = () => {
    if (!user) {
      toast.info('Sign in to vote', {
        description: 'Create an account to participate in the community'
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Latest Health Claims
          </h2> */}
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Loading claims...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Latest Health Claims
          </h2> */}
          <div className="text-center text-muted-foreground">
            <p>Unable to load claims. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (claims.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Latest Health Claims
          </h2> */}
          <div className="text-center text-muted-foreground">
            <p>No claims available yet. Be the first to contribute!</p>
            {!user && (
              <Button asChild className="mt-4">
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In to Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-6">
        {/* <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Latest Health Claims
        </h2> */}
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
          Explore community-driven health claims backed by expert reviews and scientific evidence.
          {!user && ' Sign in to vote, comment, and contribute.'}
        </p>

        {/* Sign In CTA - Top */}
        {!user && (
          <div className="flex justify-center mb-8">
            <Button asChild size="lg" variant="default">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In to Browse All Health Claims
              </Link>
            </Button>
          </div>
        )}

        {/* Claims Grid */}
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              userVotes={new Set()} // Anonymous users haven't voted
              expertProfiles={expertProfiles}
              isExpert={false} // Anonymous users are not experts
              user={user} // Can be null for anonymous users
              onVote={handleVote}
              onStanceClick={() => {}} // Disabled for anonymous
              onTitleUpdate={async () => {}} // Disabled for anonymous
              onShowReel={() => {}} // Disabled for anonymous
              onShowPaperForm={() => {}} // Disabled for anonymous
              onShowSourceForm={() => {}} // Disabled for anonymous
              onShowEvidenceInfo={() => {}} // Disabled for anonymous
              expandedStance={null}
              editingClaimId={null}
              setEditingClaimId={() => {}}
              updatingTitle={null}
              setReviewPublication={undefined}
              showShareButton={false}
            />
          ))}
        </div>

              </div>
    </section>
  );
};

export default PublicClaimsPreview;
