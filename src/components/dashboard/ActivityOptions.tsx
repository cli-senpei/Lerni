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
          variant="outline"
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-accent border-2 transition-all"
        >
          <div className="bg-muted p-3 rounded-lg">
            <Brain className="h-6 w-6 text-foreground" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-foreground">Take Assessment</div>
            <div className="text-sm text-muted-foreground">Check your skills</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('game')}
          variant="outline"
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-accent border-2 transition-all"
        >
          <div className="bg-muted p-3 rounded-lg">
            <Gamepad2 className="h-6 w-6 text-foreground" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-foreground">Play a Game</div>
            <div className="text-sm text-muted-foreground">Fun reading games</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('casual')}
          variant="outline"
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-accent border-2 transition-all"
        >
          <div className="bg-muted p-3 rounded-lg">
            <MessageCircle className="h-6 w-6 text-foreground" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-foreground">Just Chat</div>
            <div className="text-sm text-muted-foreground">Talk to me</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ActivityOptions;
