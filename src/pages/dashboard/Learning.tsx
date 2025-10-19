import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Gamepad2, Trophy } from "lucide-react";
import LearningChat from "@/components/dashboard/LearningChat";

const Learning = () => {
  const [showChat, setShowChat] = useState(false);

  const learningOptions = [
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Adaptive reading exercises tailored to your level"
    },
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "Personalized help that adapts to how you learn"
    },
    {
      icon: Gamepad2,
      title: "Game-Based Practice",
      description: "Learn through engaging, research-backed games"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "See your improvement and celebrate wins"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningOptions.map((option, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all hover:scale-105 border-2">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <option.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            onClick={() => setShowChat(true)}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-xl px-12 py-8 h-auto rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
