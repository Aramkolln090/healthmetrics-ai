
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuIcon, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          HealthyAI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#metrics">Metrics</NavLink>
          <NavLink href="#ai-assistant">AI Assistant</NavLink>
          <Link to="/chat">
            <Button
              variant="default"
              size="sm"
              className="ml-4 rounded-full px-6 transition-all duration-300 bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center"
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

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 bg-white z-40 p-6 flex flex-col pt-24 transform transition-transform duration-300 ease-in-out md:hidden",
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
          <div className="pt-4">
            <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="default"
                size="lg"
                className="w-full rounded-full"
              >
                Get Started
              </Button>
            </Link>
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
    className="text-sm font-medium hover-underline transition-colors"
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
    className="text-lg font-medium block py-2"
    onClick={onClick}
  >
    {children}
  </a>
);

export default Navbar;
