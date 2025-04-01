
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Bookmark, User, Menu, X, LogOut, Flame, ArrowUp, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getUserProgress } from '@/utils/storage';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Journal', path: '/journal', icon: Book },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Resources', path: '/resources', icon: Bookmark },
  { name: 'Profile', path: '/profile', icon: User },
];

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // If auth is still loading, don't render the navbar yet
  if (loading) {
    return null;
  }

  useEffect(() => {
    if (user) {
      try {
        const progress = getUserProgress();
        setHasCompletedOnboarding(!!progress.startDate);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      }
    }
  }, [user, pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const currentPage = navItems.find(item => item.path === pathname)?.name || 'Not Found';
    document.title = `Phoenix | ${currentPage}`;
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user && pathname !== '/welcome') {
    return null;
  }

  const welcomeLink = (!hasCompletedOnboarding && user) ? (
    <Link
      to="/welcome"
      className="text-primary/90 hover:text-primary font-medium"
    >
      Complete Onboarding
    </Link>
  ) : null;

  if (isMobile) {
    return (
      <>
        <button 
          className="fixed top-6 right-6 z-50 p-2 rounded-full bg-background/80 backdrop-blur-xl border border-border shadow-xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-background/90 backdrop-blur-xl transition-all duration-500 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <nav className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 hover:bg-accent",
                  pathname === item.path 
                    ? "bg-primary/10 text-primary font-medium scale-105" 
                    : "text-foreground/70"
                )}
              >
                <item.icon size={24} />
                <span className="text-lg">{item.name}</span>
              </Link>
            ))}
            
            {welcomeLink}
            
            {user && (
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 mt-8 shadow-md" 
                onClick={handleSignOut}
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </Button>
            )}
          </nav>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-border">
          <div className="flex justify-around items-center p-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl transition-all",
                  pathname === item.path 
                    ? "text-primary bg-primary/5" 
                    : "text-foreground/60 hover:text-foreground/80"
                )}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-red-600 mr-3 flex items-center justify-center shadow-md group-hover:shadow-primary/20 transition-all duration-300">
              <div className="relative">
                <Flame size={16} className="text-white" />
                <ArrowUp size={10} className="text-yellow-300 absolute -top-2 left-1/2 -ml-1.5 animate-float" />
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Phoenix</span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200",
                  pathname === item.path 
                    ? "bg-primary/10 text-primary font-medium shadow-sm" 
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {welcomeLink}
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 flex items-center space-x-2" 
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
