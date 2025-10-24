import { Button } from "@/components/ui/button";
import assessmentIcon from "@/assets/assessment-icon.png";
import playGameIcon from "@/assets/playagame-icon.png";
import justTalkIcon from "@/assets/justtalk-icon.png";

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
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-[hsl(142,76%,36%)]/10 hover:border-[hsl(142,76%,36%)] border-2 transition-all"
        >
          <div className="shrink-0">
            <img src={assessmentIcon} alt="Assessment" className="h-16 w-16" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-foreground">Take Assessment</div>
            <div className="text-sm text-muted-foreground">Check your skills</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('game')}
          variant="outline"
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-[hsl(142,76%,36%)]/10 hover:border-[hsl(142,76%,36%)] border-2 transition-all"
        >
          <div className="shrink-0">
            <img src={playGameIcon} alt="Play a Game" className="h-16 w-16" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-foreground">Play a Game</div>
            <div className="text-sm text-muted-foreground">Fun reading games</div>
          </div>
        </Button>

        <Button
          onClick={() => onSelectActivity('casual')}
          variant="outline"
          className="h-auto py-5 px-5 flex items-center justify-start gap-4 bg-card hover:bg-[hsl(142,76%,36%)]/10 hover:border-[hsl(142,76%,36%)] border-2 transition-all"
        >
          <div className="shrink-0">
            <img src={justTalkIcon} alt="Just Chat" className="h-16 w-16" />
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
