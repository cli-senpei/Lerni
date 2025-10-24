import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearningChat from "@/components/dashboard/LearningChat";
import marioVideo from "@/assets/mario.mp4";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full animate-fade-in">
        <LearningChat />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden">
      {/* Background Video */}
      <video
        src={marioVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
      
      {/* Content */}
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="flex flex-col items-center space-y-8 text-center animate-fade-in">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Start Learning with AI
          </h2>
          
          <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
            Your personal reading coach is ready!
          </p>
          
          <Button
            onClick={() => setShowChat(true)}
            size="lg"
            className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white font-bold text-xl h-16 px-12 transition-all hover:scale-110 hover:shadow-2xl"
          >
            Let's Go!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
