import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Lerni Logo" className="h-20 w-auto cursor-pointer" />
        </Link>
        
        <Button 
          size="lg"
          className="font-bold uppercase tracking-wide"
          onClick={() => navigate("/auth")}
        >
          Start Learning
        </Button>
      </div>
    </header>
  );
};

export default Header;
