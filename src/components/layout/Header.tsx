import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/auth/UserMenu';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Menu, UsersRound } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 mb-2 z-50 bg-primary/70 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-2 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:text-accent transition-colors"
            aria-label="The Health Integrity Project home"
          >
            <img src="/logo-hi2-tr.png" alt="The Health Integrity Project logo" className="w-7 h-7 md:w-12 md:h-12 object-contain" />
            {/* <div className="leading-none">
              <span className="text-3xl md:text-4xl font-extrabold text-white/80 -mt-1">W</span>
            </div> */}
          </Link>

          {/* Mobile Navigation - Show only Claims and Community with icons */}
          <nav className="flex md:hidden items-center gap-2">
            <Link
              to="/claims"
              className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              title="Health"
            >
              Health
            </Link>
            <Link
              to="/community"
              className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              title="Community"
            >
              Community
            </Link>
          </nav>

          {/* Desktop Navigation - Show all items */}
          <nav className="hidden text-lg md:flex items-center gap-6">
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
              Health
            </Link>
            {/* <Link to="/games" className="text-white/80 hover:text-white transition-colors">
              Games
            </Link> */}
            {/* <Link to="/features" className="text-white/80 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/legal" className="text-white/80 hover:text-white transition-colors">
              Legal
            </Link> */}
          </nav>

          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">Home</Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem asChild>
                  <Link to="/about" className="cursor-pointer">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/features" className="cursor-pointer">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/legal" className="cursor-pointer">Legal</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
