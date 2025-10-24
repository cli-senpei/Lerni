import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearningChat from "@/components/dashboard/LearningChat";
import marioVideo from "@/assets/mario.mp4";
import learningGameImage from "@/assets/learning-game.png";

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
        {/* Hero Card with Video Background */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-green-200/60">
          {/* Video Background */}
          <video
            src={marioVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 min-h-[400px]">
            {/* Game Character Image */}
            <div className="flex-shrink-0 mb-6 md:mb-0">
              <img 
                src={learningGameImage} 
                alt="Learning Game Character" 
                className="w-64 md:w-80 h-auto drop-shadow-2xl rounded-3xl transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_25px_50px_rgba(251,146,60,0.6)]"
              />
            </div>
            
            {/* Button Integrated into Scene */}
            <div className="flex-1 flex justify-center md:justify-end items-center">
              <Button
                onClick={() => setShowChat(true)}
                size="lg"
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-2xl px-12 py-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(251,146,60,0.5)] transition-all hover:scale-110 border-4 border-yellow-300/50"
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
