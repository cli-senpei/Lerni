import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearningChat from "@/components/dashboard/LearningChat";
import learningGameImage from "@/assets/learning-game.png";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="h-[calc(100vh-12rem)] animate-fade-in">
        <LearningChat />
      </div>
    );
  }

  return (
    <div className="flex items-center px-6 py-6 md:py-8 md:px-12 bg-background">
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
            Start Your Reading Adventure
          </h2>
          
          <p className="text-center text-base text-muted-foreground lg:text-left max-w-xl">
            Chat with AI to play fun reading games! Your personal reading coach makes learning exciting and easy. Let's start!
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={() => setShowChat(true)}
              size="lg"
              className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white font-bold text-lg h-14"
            >
              Improve Reading with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
