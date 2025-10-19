import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Star, Award, Home, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FullGameModeProps {
  userName: string;
  weaknesses: string[];
  points: number;
  onPointsEarned: (amount: number) => void;
  onExitToChat: () => void;
}

const FullGameMode = ({ userName, weaknesses, points, onPointsEarned, onExitToChat }: FullGameModeProps) => {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [aiMinimized, setAiMinimized] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Generate game content based on weaknesses
  const gameWords = weaknesses.includes("basic-words")
    ? ["cat", "hat", "bat", "rat", "mat"]
    : weaknesses.includes("medium-words")
    ? ["jump", "play", "read", "swim", "climb"]
    : ["friend", "happy", "school", "teacher", "learning"];

  const hints = [
    `You're doing great, ${userName}!`,
    "Keep focusing on the sounds!",
    "Remember to sound it out slowly.",
    "You've got this! Take your time.",
    "Nice work! Keep it up!",
  ];

  useEffect(() => {
    // Show hint at milestones (every 3 correct answers)
    if (correctCount > 0 && correctCount % 3 === 0) {
      showRandomHint();
    }
  }, [correctCount]);

  const showRandomHint = () => {
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setHintMessage(randomHint);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  };

  const handleWordComplete = () => {
    setCorrectCount(correctCount + 1);
    onPointsEarned(25);
    setSelectedWord(null);
    
    if (correctCount + 1 >= 5) {
      // Game complete
      setHintMessage(`Amazing work, ${userName}! You completed the game!`);
      setShowHint(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-50">
      {/* Navigation Buttons */}
      <div className="fixed top-4 left-4 flex gap-2 z-50">
        <Button
          onClick={() => navigate("/dashboard/home")}
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-full shadow-lg"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      {/* AI Assistant Toggle */}
      <div className="fixed top-4 right-4 z-50">
        {aiMinimized ? (
          <Button
            onClick={() => setAiMinimized(false)}
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg animate-pulse"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        ) : (
          <Card className="p-4 bg-background/95 backdrop-blur shadow-xl max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-sm">Lerni</span>
              </div>
              <Button
                onClick={() => setAiMinimized(true)}
                size="icon"
                variant="ghost"
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              I'm here if you need help! Keep going!
            </p>
            <Button
              onClick={onExitToChat}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </Card>
        )}
      </div>

      {/* Points Display */}
      <div className="fixed top-20 left-4 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
        <Star className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold">{points}</span>
      </div>

      {/* Hint Popup */}
      {showHint && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Card className="bg-primary text-primary-foreground px-6 py-3 shadow-2xl">
            <p className="text-base font-medium">{hintMessage}</p>
          </Card>
        </div>
      )}

      {/* Game Content */}
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Reading Challenge
            </h2>
            <p className="text-lg text-muted-foreground">
              Round {currentRound} - Match the words!
            </p>
          </div>

          {correctCount < 5 ? (
            <Card className="p-6 md:p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl mb-6">Select a word to practice:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {gameWords.map((word, index) => (
                      <Button
                        key={index}
                        onClick={() => {
                          setSelectedWord(word);
                          setTimeout(handleWordComplete, 1000);
                        }}
                        disabled={selectedWord !== null}
                        className="text-2xl font-bold px-8 py-6 h-auto"
                        variant={selectedWord === word ? "default" : "outline"}
                      >
                        {word}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-center text-muted-foreground">
                  Progress: {correctCount} / 5
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-6">
              <Award className="w-20 h-20 mx-auto text-primary animate-bounce" />
              <h3 className="text-3xl font-bold">Congratulations, {userName}!</h3>
              <p className="text-xl text-muted-foreground">
                You've completed the reading challenge!
              </p>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Star className="w-6 h-6 text-primary" />
                <span className="font-bold">Total Points: {points}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullGameMode;
