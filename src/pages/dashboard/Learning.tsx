import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Gamepad2 } from "lucide-react";
import LearningChat from "@/components/dashboard/LearningChat";
import learningGameImage from "@/assets/learning-game.png";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="animate-fade-in">
        <LearningChat />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center px-6 py-8 md:py-12 md:px-12 bg-background">
      <div className="mx-auto grid w-full max-w-screen-xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Image - Left Side */}
        <div className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[500px]">
            <img
              src={learningGameImage}
              alt="AI Learning Game Character"
              className="w-full animate-fade-in"
            />
          </div>
        </div>
        
        {/* Content - Right Side */}
        <div className="flex flex-col items-center space-y-6 lg:items-start">
          <h2 className="max-w-xl text-center text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-left lg:text-4xl">
            Choose Your Learning Path
          </h2>
          
          <p className="text-center text-base text-muted-foreground lg:text-left max-w-xl">
            Unlock your potential with AI-powered learning tools designed to make reading fun and effective. Start your journey today!
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={() => setShowChat(true)}
              size="lg"
              className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white font-bold text-lg h-14"
            >
              <Brain className="w-5 h-5 mr-2" />
              Improve Reading with AI
            </Button>
            
            <Button
              onClick={() => setShowChat(true)}
              size="lg"
              className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white font-bold text-lg h-14"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Play AI Learning Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
