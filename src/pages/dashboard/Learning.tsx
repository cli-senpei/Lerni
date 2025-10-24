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
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-background to-emerald-50/20">
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Hero Card - Clean & Accessible */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-100/60 to-emerald-100/50 p-6 md:p-10 border border-green-200/40 shadow-lg">
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Video - Contained */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="w-full max-w-[280px] md:max-w-[320px]">
                <video
                  src={marioVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full rounded-2xl shadow-md border border-green-200/30"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black mb-4 text-green-900 tracking-tight">
                Start Learning
              </h1>
              <p className="text-base md:text-lg text-green-800/80 font-medium mb-6">
                Your personal reading coach is ready!
              </p>
              
              <Button
                onClick={() => setShowChat(true)}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Let's Go!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
