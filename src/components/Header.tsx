import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  hideButton?: boolean;
}

const Header = ({ hideButton = false }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto flex h-20 md:h-24 max-w-screen-2xl items-center justify-between px-4 md:px-12">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={logo} 
            alt="Lerni Logo" 
            className="h-16 md:h-20 w-auto cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-1" 
          />
        </Link>
        
        {!hideButton && (
          <Button 
            size="lg"
            className="font-bold uppercase tracking-wide text-xs md:text-sm"
            onClick={() => navigate("/auth")}
          >
            Start Learning
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
