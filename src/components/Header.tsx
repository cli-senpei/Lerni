import logo from "@/assets/logo.svg";

const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Lerni Logo" className="h-12 w-auto" />
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <span>Site Language:</span>
          <button className="text-foreground">English</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
