import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star, Award, Target, Clock } from "lucide-react";

interface Balloon {
  id: string;
  word: string;
  isTarget: boolean;
  x: number;
  y: number;
  color: string;
  speed: number;
}

interface PhonicsPopGameProps {
  userName: string;
  points: number;
  onPointsEarned: (amount: number) => void;
  onExitToChat: () => void;
}

const PhonicsPopGame = ({ userName, points, onPointsEarned, onExitToChat }: PhonicsPopGameProps) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [targetPattern, setTargetPattern] = useState("-ful");
  const [showCelebration, setShowCelebration] = useState(false);
  const gameCanvasRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Word lists for different patterns
  const wordLists: Record<string, { target: string[]; distractor: string[] }> = {
    "-ful": {
      target: ["helpful", "playful", "careful", "joyful", "thankful", "wonderful", "beautiful", "colorful", "harmful", "peaceful"],
      distractor: ["help", "play", "care", "joy", "thank", "wonder", "beauty", "color", "harm", "peace"]
    },
    "-ing": {
      target: ["running", "jumping", "reading", "playing", "singing", "dancing", "walking", "talking", "eating", "sleeping"],
      distractor: ["run", "jump", "read", "play", "sing", "dance", "walk", "talk", "eat", "sleep"]
    },
    "sh-": {
      target: ["ship", "shop", "sheep", "shell", "shake", "shine", "shoe", "shark", "shed", "sharp"],
      distractor: ["chip", "chop", "cheap", "bell", "cake", "wine", "blue", "park", "bed", "harp"]
    }
  };

  const balloonColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
    '#06b6d4', '#3b82f6', '#ef4444', '#84cc16'
  ];

  useEffect(() => {
    if (gameActive) {
      startGame();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    createInitialBalloons();
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const createInitialBalloons = () => {
    const newBalloons: Balloon[] = [];
    const words = wordLists[targetPattern];
    
    for (let i = 0; i < 12; i++) {
      const isTarget = Math.random() > 0.5;
      const wordArray = isTarget ? words.target : words.distractor;
      const word = wordArray[Math.floor(Math.random() * wordArray.length)];
      const colorIndex = Math.floor(Math.random() * balloonColors.length);
      
      newBalloons.push({
        id: `balloon-${Date.now()}-${i}`,
        word,
        isTarget,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        color: isTarget ? '#f59e0b' : balloonColors[colorIndex],
        speed: 3 + Math.random() * 2
      });
    }
    
    setBalloons(newBalloons);
  };

  const handleBalloonClick = (balloon: Balloon) => {
    if (!gameActive) return;

    setTotalAnswers((prev) => prev + 1);

    if (balloon.isTarget) {
      // Correct answer
      const pointsEarned = 10 + (streak * 2);
      setScore((prev) => prev + pointsEarned);
      setStreak((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
      
      // Remove balloon and create new one
      setBalloons((prev) => {
        const filtered = prev.filter((b) => b.id !== balloon.id);
        return [...filtered, createNewBalloon()];
      });

      // Show celebration for streaks
      if ((streak + 1) % 5 === 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
      }
    } else {
      // Wrong answer
      setStreak(0);
      // Just remove the balloon, don't create new one (penalty)
      setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
    }
  };

  const createNewBalloon = (): Balloon => {
    const words = wordLists[targetPattern];
    const isTarget = Math.random() > 0.4;
    const wordArray = isTarget ? words.target : words.distractor;
    const word = wordArray[Math.floor(Math.random() * wordArray.length)];
    const colorIndex = Math.floor(Math.random() * balloonColors.length);
    
    return {
      id: `balloon-${Date.now()}-${Math.random()}`,
      word,
      isTarget,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      color: isTarget ? '#f59e0b' : balloonColors[colorIndex],
      speed: 3 + Math.random() * 2
    };
  };

  const endGame = () => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const pointsEarned = Math.floor(score / 2);
    onPointsEarned(pointsEarned);
  };

  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 via-background to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Phonics Pop</h2>
            <p className="text-sm text-muted-foreground">Pop balloons with "{targetPattern}" words!</p>
          </div>
        </div>
        <Button onClick={onExitToChat} variant="ghost" size="sm">
          Exit Game
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center border shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
          <div className="text-2xl font-bold text-primary">{score}</div>
        </div>
        
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center border shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <div className="text-2xl font-bold text-accent">{streak}</div>
        </div>
        
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center border shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Time</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{timeLeft}s</div>
        </div>
        
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center border shadow-sm">
          <span className="text-xs text-muted-foreground block mb-1">Accuracy</span>
          <div className="text-2xl font-bold text-green-500">{accuracy}%</div>
        </div>
      </div>

      {/* Game Canvas */}
      <div 
        ref={gameCanvasRef}
        className="flex-1 relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl border-4 border-white shadow-2xl overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {!gameActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold">Ready to Pop Some Balloons?</h3>
              <p className="text-lg text-muted-foreground max-w-md">
                Click on the golden balloons that contain words with <span className="font-bold text-primary">"{targetPattern}"</span> pattern!
              </p>
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium">💡 Tip: Golden balloons = Correct answers!</p>
              </div>
            </div>
            <Button 
              onClick={() => setGameActive(true)}
              size="lg"
              className="text-lg h-14 px-8"
            >
              <Target className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        ) : (
          <>
            {balloons.map((balloon) => (
              <button
                key={balloon.id}
                onClick={() => handleBalloonClick(balloon)}
                className="absolute transition-all duration-300 hover:scale-110 animate-float cursor-pointer"
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                  animationDuration: `${balloon.speed}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                <div 
                  className={`w-20 h-24 rounded-full shadow-lg flex items-center justify-center font-bold text-white text-sm px-2 ${
                    balloon.isTarget ? 'ring-4 ring-yellow-300 ring-offset-2' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${balloon.color}, ${balloon.color}dd)`,
                  }}
                >
                  {balloon.word}
                </div>
                <div 
                  className="w-0.5 h-6 mx-auto"
                  style={{ background: 'linear-gradient(to bottom, #94a3b8, #64748b)' }}
                />
              </button>
            ))}
          </>
        )}
        
        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold animate-bounce">
              🎉 Streak x{streak}! 🎉
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {!gameActive && score > 0 && (
        <div className="mt-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 border shadow-sm">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">
              Great job, {userName}! You earned {Math.floor(score / 2)} points! 🎯
            </p>
            <p className="text-sm text-muted-foreground">
              Final Score: {score} | Accuracy: {accuracy}% | Correct: {correctAnswers}/{totalAnswers}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(-2deg);
          }
          75% {
            transform: translateY(-25px) rotate(1deg);
          }
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PhonicsPopGame;
