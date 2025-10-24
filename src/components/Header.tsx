import logo from "@/assets/logo.png";
import homeLogo from "@/assets/home.png";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  hideButton?: boolean;
}

const Header = ({ hideButton = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto flex h-20 md:h-24 max-w-screen-2xl items-center justify-between px-4 md:px-12">
        <Link 
          to="/" 
          className="relative flex items-center gap-2 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-24 md:h-28 w-24 md:w-28 flex items-center justify-center">
            <img 
              src={logo} 
              alt="Lerni Logo" 
              className={`absolute inset-0 h-full w-full object-contain cursor-pointer transition-all duration-500 ease-in-out ${
                isHovered 
                  ? 'opacity-0 scale-90 rotate-12' 
                  : 'opacity-100 scale-100 rotate-0 group-hover:scale-110 group-hover:-translate-y-1'
              }`}
            />
            <img 
              src={homeLogo} 
              alt="Home" 
              className={`absolute inset-0 h-full w-full object-contain cursor-pointer transition-all duration-500 ease-in-out ${
                isHovered 
                  ? 'opacity-100 scale-100 rotate-0 group-hover:scale-110 group-hover:-translate-y-1' 
                  : 'opacity-0 scale-90 -rotate-12'
              }`}
            />
          </div>
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
