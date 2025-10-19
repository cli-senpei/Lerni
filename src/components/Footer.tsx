import logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="MindLearn Logo" className="h-8 w-auto" />
              <span className="text-lg font-bold">MindLearn</span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Because every mind learns differently—and every win matters.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="transition-colors hover:text-foreground">About</a></li>
              <li><a href="#contact" className="transition-colors hover:text-foreground">Contact</a></li>
              <li><a href="#help" className="transition-colors hover:text-foreground">Help Center</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MindLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
