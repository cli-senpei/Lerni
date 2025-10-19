import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Gamepad2, Sparkles } from "lucide-react";
import LearningChat from "@/components/dashboard/LearningChat";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  const learningOptions = [
    {
      icon: Brain,
      title: "Improve Reading with AI",
      description: "Personalized AI-powered reading lessons",
      gradient: "from-blue-500 via-purple-500 to-pink-500"
    },
    {
      icon: Gamepad2,
      title: "Play AI Learning Game",
      description: "Interactive gaming experience",
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    }
  ];

  if (showChat) {
    return (
      <div className="animate-fade-in">
        <LearningChat />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 space-y-12 animate-fade-in">
        {/* Epic title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              LEVEL UP
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
            Choose Your Path
          </p>
        </div>

        {/* Game-style buttons */}
        <div className="flex flex-col gap-6">
          {learningOptions.map((option, index) => (
            <Card
              key={index}
              onClick={() => setShowChat(true)}
              className="group relative overflow-hidden border-2 border-primary/50 bg-background/80 backdrop-blur-sm hover:border-primary transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-primary/50"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Animated shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative p-8 flex items-center gap-6">
                {/* Icon with glow */}
                <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${option.gradient} shadow-lg group-hover:shadow-2xl transition-all duration-500`}>
                  <option.icon className="w-12 h-12 text-white relative z-10" />
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.gradient} blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500`} />
                </div>
                
                {/* Text content */}
                <div className="flex-1 text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                    {option.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                    <span className="text-white text-2xl">→</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Subtitle */}
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Your adventure begins now...
        </p>
      </div>
    </div>
  );
};

export default Learning;
