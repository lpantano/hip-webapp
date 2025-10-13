import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/auth/UserMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Users } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:text-accent transition-colors"
            aria-label="ClaimWell home"
          >
            <img src="/logo-only-transparent.png" alt="ClaimWell logo" className="w-9 h-9 object-contain -mt-2 -mb-2" />
            <div className="leading-none">
              <span className="text-3xl md:text-4xl font-extrabold text-white/80 -mt-1">W</span>
            </div>
          </Link>
          
          {/* Mobile Navigation - Show only Claims and Community with icons */}
          <nav className="flex md:hidden items-center gap-4">
            <Link 
              to="/claims" 
              className="text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
              title="Claims"
            >
              <FileText className="w-7 h-7" />
            </Link>
            <Link 
              to="/community" 
              className="text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
              title="Community"
            >
              <Users className="w-7 h-7" />
            </Link>
          </nav>

          {/* Desktop Navigation - Show all items */}
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
            {/* Mobile Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <div className="md:hidden w-14 h-14 flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                  <Menu className="h-8 w-8" />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-32 bg-background/95 backdrop-blur-sm">
                <div className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/" 
                    className="text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/features" 
                    className="text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    to="/legal" 
                    className="text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Legal
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Menu / Auth Button */}
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