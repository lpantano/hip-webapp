import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-background/60">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-muted-foreground">© {year} Health Integrity Project. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">
              Logo designed by <a href="https://www.monikamistry.com/creative-design/" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">Monika Mistry</a>.
            </p>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/legal" className="text-muted-foreground hover:text-primary underline">Terms & Privacy</Link>
            <a href="mailto:hello@healthintegrityproject.org" className="text-muted-foreground hover:text-primary underline">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
