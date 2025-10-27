import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow p-2 shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">StudyForge AI</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/generate"
                className={`text-sm font-medium transition-all hover:text-primary relative group ${
                  isActive("/generate") ? "text-primary" : "text-foreground/80"
                }`}
              >
                Generate
                {isActive("/generate") && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-full" />
                )}
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-all hover:text-primary relative ${
                  isActive("/dashboard") ? "text-primary" : "text-foreground/80"
                }`}
              >
                Dashboard
                {isActive("/dashboard") && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-full" />
                )}
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium transition-all hover:text-primary relative ${
                  isActive("/profile") ? "text-primary" : "text-foreground/80"
                }`}
              >
                Profile
                {isActive("/profile") && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-full" />
                )}
              </Link>
            </div>
          )}

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user.email?.split("@")[0]}
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  className="border-border/50 hover:border-primary/50 hover:bg-card transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-lg transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 glass-effect animate-fade-in-down">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {user ? (
              <>
                <Link
                  to="/generate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                >
                  Generate
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                >
                  Profile
                </Link>
                <Button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  variant="outline" 
                  className="w-full justify-start border-border/50 hover:border-primary/50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
