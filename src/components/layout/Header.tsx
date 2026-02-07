import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/auth/UserMenu';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 mb-2 z-50 bg-primary/70 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-1 md:px-6 md:py-1">
        <div className="flex items-center justify-between">
          <Link
            to="/project"
            className="flex items-center gap-3 hover:text-accent transition-colors"
            aria-label="The Health Integrity Project home"
          >
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden">
              <img src="/logo2.png" alt="The Health Integrity Project logo" className="w-full h-full object-cover" />
            </div>
            {/* <div className="leading-none">
              <span className="text-3xl md:text-4xl font-extrabold text-white/80 -mt-1">W</span>
            </div> */}
          </Link>

          {/* Mobile Navigation - Show only Claims */}
          <nav className="flex md:hidden items-center gap-2">
            <Link
              to="/"
              className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              title="Health"
            >
              Health Claims
            </Link>
          </nav>

          {/* Desktop Navigation - Show all items */}
          <nav className="hidden text-lg md:flex items-center gap-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              Health Claims
            </Link>
            <Link to="/project" className="text-white/80 hover:text-white transition-colors">
              The Project
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/community" className="text-white/80 hover:text-white transition-colors">
              Community
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
            {/* Social Media Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/health-integrity-project"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
                aria-label="Visit us on LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/health.integrity.project"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
                aria-label="Follow us on Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>

            {/* Mobile Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/community" className="cursor-pointer">Community</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="cursor-pointer">About</Link>
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
