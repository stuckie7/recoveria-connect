
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bookmark, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Resources', path: '/resources', icon: Bookmark },
  { name: 'Profile', path: '/profile', icon: User },
];

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Update the document title based on the current route
  useEffect(() => {
    const currentPage = navItems.find(item => item.path === pathname)?.name || 'Not Found';
    document.title = `Recovery App | ${currentPage}`;
  }, [pathname]);

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button 
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile Menu */}
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-md transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 hover:bg-muted",
                  pathname === item.path 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground/70"
                )}
              >
                <item.icon size={24} />
                <span className="text-lg">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-t border-border">
          <div className="flex justify-around items-center p-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                  pathname === item.path 
                    ? "text-primary" 
                    : "text-foreground/60 hover:text-foreground/80"
                )}
              >
                <item.icon size={24} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop navigation
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary mr-2"></div>
            <span className="font-semibold text-lg">Recovery</span>
          </Link>
          
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                  pathname === item.path 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
