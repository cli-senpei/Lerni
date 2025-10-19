import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background px-6 py-12 md:px-12">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Lerni Logo" className="h-16 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground">
              Learning designed for every mind.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-bold text-foreground">About</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">Our Mission</a></li>
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">Research</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-bold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground transition-colors hover:text-accent">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Lerni. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
