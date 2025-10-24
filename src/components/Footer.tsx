import { Link } from "react-router-dom";
import { Target, Lightbulb, BookOpen, HelpCircle, Mail, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background px-6 py-12 md:px-12">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">About</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/our-mission" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <Target className="h-4 w-4" />
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <Lightbulb className="h-4 w-4" />
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/research" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <BookOpen className="h-4 w-4" />
                  Research
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help-center" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <Shield className="h-4 w-4" />
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">&copy; 2025 Lerni. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70 mt-2 font-mono">Coded By CLI Senpei</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
