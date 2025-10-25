import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-br from-primary to-primary-glow p-2 shadow-lg group-hover:shadow-primary/50 transition-all">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">StudyForge AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/generate"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/generate") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Generate
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/profile") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-primary hover:bg-primary-glow shadow-lg hover:shadow-primary/50 transition-all">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/generate"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Generate
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Profile
            </Link>
            <Button className="w-full bg-primary hover:bg-primary-glow">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
