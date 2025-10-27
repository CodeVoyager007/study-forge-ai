import { Link } from "react-router-dom";
import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 glass-effect mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 animate-fade-in">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow p-2 shadow-lg group-hover:shadow-glow transition-all">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">StudyForge AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering learners with AI-powered study materials. Transform any topic into comprehensive learning resources.
            </p>
          </div>

          {/* Product */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/generate" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  All Tools
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
          <p className="text-sm text-muted-foreground">
            © 2025 StudyForge AI. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
