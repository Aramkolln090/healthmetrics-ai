import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuIcon, X, LogIn, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/chat');
  };
  
  const handleNavigateToMetrics = () => {
    if (user) {
      navigate('/metrics');
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to view metrics",
        variant: "destructive",
      });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out dark:bg-healthBlue-950 dark:border-b dark:border-healthBlue-900/70",
        isScrolled
          ? "bg-white/80 dark:bg-healthBlue-950/95 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity text-healthBlue-950 dark:text-healthBlue-200"
        >
          HealthyAI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#reminders">Reminders</NavLink>
          <NavLink href="#metrics">Metrics</NavLink>
          <NavLink href="#ai-assistant">AI Assistant</NavLink>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="ml-4 gap-2 text-healthBlue-700 border-healthBlue-700/30 hover:bg-healthBlue-700/10 dark:text-healthBlue-500 dark:border-healthBlue-500/30 dark:hover:bg-healthBlue-500/10"
            onClick={handleNavigateToMetrics}
          >
            <Activity className="h-4 w-4" />
            View Metrics
          </Button>

          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 text-healthBlue-700 border-healthBlue-700/30 hover:bg-healthBlue-700/10 dark:text-healthBlue-500 dark:border-healthBlue-500/30 dark:hover:bg-healthBlue-500/10"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          ) : (
            <AuthModal 
              triggerButton={
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 text-healthBlue-700 border-healthBlue-700/30 hover:bg-healthBlue-700/10 dark:text-healthBlue-500 dark:border-healthBlue-500/30 dark:hover:bg-healthBlue-500/10"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              }
            />
          )}

          <Button
            variant="default"
            size="sm"
            className="rounded-full px-6 transition-all duration-300 bg-healthBlue-700 hover:bg-healthBlue-900 text-white dark:bg-healthBlue-700 dark:hover:bg-healthBlue-500"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            className="flex items-center text-healthBlue-950 dark:text-healthBlue-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 bg-white dark:bg-healthBlue-950 z-40 p-6 flex flex-col pt-24 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="flex flex-col space-y-6 text-center">
          <MobileNavLink
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </MobileNavLink>
          <MobileNavLink
            href="#reminders"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Reminders
          </MobileNavLink>
          <MobileNavLink
            href="#metrics"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Metrics
          </MobileNavLink>
          <MobileNavLink
            href="#ai-assistant"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            AI Assistant
          </MobileNavLink>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleNavigateToMetrics();
            }}
          >
            <Activity className="h-4 w-4" />
            View Metrics
          </Button>

          {user ? (
            <Button 
              variant="outline"  
              className="w-full"
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
            >
              Sign Out
            </Button>
          ) : (
            <AuthModal 
              triggerButton={
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              }
            />
          )}

          <div className="pt-4">
            <Button
              variant="default"
              size="lg"
              className="w-full rounded-full"
              onClick={() => {
                handleGetStarted();
                setIsMobileMenuOpen(false);
              }}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <a
    href={href}
    className="text-sm font-medium hover-underline transition-colors text-healthBlue-900 dark:text-healthBlue-200"
  >
    {children}
  </a>
);

interface MobileNavLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}

const MobileNavLink = ({ href, onClick, children }: MobileNavLinkProps) => (
  <a
    href={href}
    className="text-lg font-medium block py-2 text-healthBlue-900 dark:text-healthBlue-200"
    onClick={onClick}
  >
    {children}
  </a>
);

export default Navbar;
