import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/auth/UserMenu';

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:text-accent transition-colors"
            aria-label="ClaimWell home"
          >
            <img src="/logo-only-transparent.png" alt="ClaimWell logo" className="w-12 h-12 object-contain -mt-2 -mb-2" />
            <div className="leading-none">
              <span className="text-3xl md:text-6xl font-extrabold text-white/80 -mt-1">W</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/community" className="text-white/80 hover:text-white transition-colors">
              Community
            </Link>
            <Link to="/claims" className="text-white/80 hover:text-white transition-colors">
              Claims
            </Link>
            {/* <Link to="/games" className="text-white/80 hover:text-white transition-colors">
              Games
            </Link> */}
            <Link to="/features" className="text-white/80 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/legal" className="text-white/80 hover:text-white transition-colors">
              Legal
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button asChild variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;