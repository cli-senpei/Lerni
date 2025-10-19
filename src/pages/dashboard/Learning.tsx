import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Gamepad2, Trophy } from "lucide-react";
import LearningChat from "@/components/dashboard/LearningChat";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  const learningOptions = [
    {
      icon: Brain,
      title: "Start AI Learning",
      description: "Personalized lessons that adapt to how you learn"
    },
    {
      icon: Gamepad2,
      title: "AI Mini Games",
      description: "Fun, interactive games designed for learning"
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
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Start Your Learning Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience personalized, AI-powered learning designed specifically for dyslexia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {learningOptions.map((option, index) => (
            <Card 
              key={index} 
              className="p-8 hover:shadow-lg transition-all hover:scale-105 border-2 cursor-pointer"
              onClick={() => setShowChat(true)}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary to-accent">
                  <option.icon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3">{option.title}</h3>
                  <p className="text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learning;
