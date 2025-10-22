import { Button } from "@/components/ui/button";
import { Brain, Gamepad2, MessageCircle, Target } from "lucide-react";

interface ActivityOptionsProps {
  onSelectActivity: (activity: 'assessment' | 'game' | 'casual') => void;
  userName?: string;
}

const ActivityOptions = ({ onSelectActivity, userName }: ActivityOptionsProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-center text-lg text-foreground font-medium">
        {userName ? `Hey ${userName}! ` : "Hi! "}What would you like to do today? 🎮
      </p>
      
      <div className="grid gap-3 max-w-md mx-auto">
        <Button
          onClick={() => onSelectActivity('assessment')}
          className="h-auto py-6 px-6 flex items-center justify-start gap-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="bg-white/20 p-3 rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg">Take Assessment</div>
            <div className="text-sm opacity-90">Quick mini-games to check your skills</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('game')}
          className="h-auto py-6 px-6 flex items-center justify-start gap-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="bg-white/20 p-3 rounded-lg">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg">Play a Game</div>
            <div className="text-sm opacity-90">Fun reading and word games</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('casual')}
          className="h-auto py-6 px-6 flex items-center justify-start gap-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="bg-white/20 p-3 rounded-lg">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg">Just Chat</div>
            <div className="text-sm opacity-90">Talk to me about anything!</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ActivityOptions;
