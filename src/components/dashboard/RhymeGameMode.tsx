import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Star, Award, Home, ArrowLeft, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import lerniIcon from "@/assets/lerni.png";
import { PerformanceSample } from "@/lib/simpleAdaptiveAI";

interface RhymeGameModeProps {
  userName: string;
  weaknesses: string[];
  points: number;
  onPointsEarned: (amount: number) => void;
  onExitToChat: () => void;
  onPerformanceRecord?: (sample: PerformanceSample) => Promise<void>;
  currentDifficulty?: 'easy' | 'medium' | 'hard';
}

// Rhyme word groups
const RHYME_GROUPS: Record<string, Array<[string, string]>> = {
  "-at": [["cat", "🐱"], ["bat", "🦇"], ["hat", "🎩"], ["rat", "🐀"], ["mat", "🧶"]],
  "-ap": [["cap", "🧢"], ["map", "🗺️"], ["tap", "🚰"], ["nap", "😴"]],
  "-an": [["pan", "🍳"], ["can", "🥫"], ["man", "🧍"], ["fan", "🌀"]],
  "-it": [["sit", "🪑"], ["kit", "🎒"], ["pit", "🕳️"], ["lit", "🕯️"]],
  "-op": [["mop", "🧹"], ["hop", "🐇"], ["top", "🔝"], ["pop", "🍿"]],
  "-og": [["dog", "🐶"], ["log", "🪵"], ["frog", "🐸"]],
};

interface WordChoice {
  word: string;
  emoji: string;
  rhymeKey: string;
}

const RhymeGameMode = ({ userName, weaknesses, points, onPointsEarned, onExitToChat }: RhymeGameModeProps) => {
  const navigate = useNavigate();
  const [aiMinimized, setAiMinimized] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [stars, setStars] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  
  const [targetWord, setTargetWord] = useState<WordChoice | null>(null);
  const [choices, setChoices] = useState<WordChoice[]>([]);
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [wrongWords, setWrongWords] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"" | "success" | "error">("");
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  // Initialize first round
  useEffect(() => {
    setupRound();
  }, []);

  // AI hints at milestones
  useEffect(() => {
    if (stars > 0 && stars % 2 === 0) {
      showRandomHint();
    }
  }, [stars]);

  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const setupRound = () => {
    setFeedback("");
    setFeedbackType("");
    setMistakes(0);
    setWrongWords(new Set());
    setFoundWords(new Set());
    setSelectedTile(null);

    // Pick a rhyme group with at least 3 words
    const keys = Object.keys(RHYME_GROUPS).filter(k => RHYME_GROUPS[k].length >= 3);
    const rhymeKey = keys[Math.floor(Math.random() * keys.length)];
    const wordGroup = RHYME_GROUPS[rhymeKey].map(([w, e]) => ({ word: w, emoji: e, rhymeKey }));

    // Pick target
    const target = wordGroup[Math.floor(Math.random() * wordGroup.length)];
    setTargetWord(target);

    // Pick 2 correct answers (excluding target)
    const correct = shuffle(wordGroup.filter(x => x.word !== target.word)).slice(0, 2);
    setCorrectWords(new Set(correct.map(x => x.word)));

    // Pick distractors from other rhyme groups
    const allWords = Object.entries(RHYME_GROUPS)
      .filter(([k]) => k !== rhymeKey)
      .flatMap(([k, words]) => words.map(([w, e]) => ({ word: w, emoji: e, rhymeKey: k })));
    const distractors = shuffle(allWords).slice(0, 4);

    // Combine and shuffle
    setChoices(shuffle([...correct, ...distractors]));

    // Speak target word
    speakText(`Find words that rhyme with ${target.word}`);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("Speech synthesis not available");
      }
    }
  };

  const showRandomHint = () => {
    const hints = [
      `Great work, ${userName}! Keep listening for the rhymes!`,
      "You're doing amazing! Focus on the ending sounds!",
      "Fantastic! You're getting better at finding rhymes!",
      `Excellent progress, ${userName}! Keep it up!`,
    ];
    const hint = hints[Math.floor(Math.random() * hints.length)];
    setHintMessage(hint);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  };

  const handleTileClick = (choice: WordChoice) => {
    if (foundWords.has(choice.word)) return;

    speakText(choice.word);
    setSelectedTile(choice.word);

    if (correctWords.has(choice.word)) {
      // Correct answer!
      setFoundWords(prev => new Set([...prev, choice.word]));
      setFeedback("Yes! That rhymes!");
      setFeedbackType("success");
      onPointsEarned(15);

      // Check if round complete
      if (foundWords.size + 1 === correctWords.size) {
        setTimeout(() => completeRound(), 600);
      }
    } else {
      // Wrong answer
      if (!wrongWords.has(choice.word)) {
        setWrongWords(prev => new Set([...prev, choice.word]));
        setMistakes(prev => prev + 1);
      }
      setFeedback("Not quite! Try again.");
      setFeedbackType("error");
      
      setTimeout(() => {
        setSelectedTile(null);
        setFeedback("");
        setFeedbackType("");
      }, 800);
    }
  };

  const completeRound = () => {
    const gotStar = mistakes <= 1;
    if (gotStar) {
      setStars(prev => prev + 1);
      onPointsEarned(25); // Bonus for completing round
    }
    
    setFeedback(gotStar ? "Perfect! ⭐ Star earned!" : "Nice job!");
    setFeedbackType("success");

    if (currentRound >= totalRounds) {
      setTimeout(() => {
        setGameComplete(true);
        setHintMessage(`Amazing work, ${userName}! You completed all ${totalRounds} rounds!`);
        setShowHint(true);
      }, 1000);
    } else {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setupRound();
      }, 1500);
    }
  };

  const handleHearWord = () => {
    if (targetWord) {
      speakText(`Target word: ${targetWord.word}`);
      setFeedback("");
      setFeedbackType("");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-50">
      {/* Navigation */}
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

      {/* AI Assistant */}
      <div className="fixed top-4 right-4 z-50">
        {aiMinimized ? (
          <Button
            onClick={() => setAiMinimized(false)}
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg animate-pulse bg-white hover:bg-white/90 p-1"
          >
            <img src={lerniIcon} alt="Lerni" className="w-full h-full rounded-full" />
          </Button>
        ) : (
          <Card className="p-4 bg-background/95 backdrop-blur shadow-xl max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={lerniIcon} alt="Lerni" className="w-full h-full object-cover" />
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
              Listen for the rhymes! I'm here to help!
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

      {/* Points & Round Display */}
      <div className="fixed top-20 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold">{points}</span>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
          <span className="text-sm font-medium">⭐ {stars}</span>
        </div>
      </div>

      {/* Hint Popup */}
      {showHint && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Card className="bg-primary text-primary-foreground px-6 py-3 shadow-2xl max-w-md">
            <p className="text-base font-medium">{hintMessage}</p>
          </Card>
        </div>
      )}

      {/* Game Content */}
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {!gameComplete ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Rhyme Match</h2>
                <p className="text-lg text-muted-foreground">
                  Round {currentRound} of {totalRounds}
                </p>
              </div>

              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Target Word */}
                <Card className="p-6 flex flex-col items-center justify-center gap-4 bg-card/50 backdrop-blur">
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 relative">
                    <span className="text-6xl" role="img" aria-label={targetWord?.word}>
                      {targetWord?.emoji}
                    </span>
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: "3s" }}></div>
                  </div>
                  <div className="text-3xl font-bold">{targetWord?.word}</div>
                  <Button onClick={handleHearWord} className="w-full">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Hear Word
                  </Button>
                </Card>

                {/* Choices Grid */}
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {choices.map((choice, index) => {
                      const isFound = foundWords.has(choice.word);
                      const isWrong = selectedTile === choice.word && !correctWords.has(choice.word);
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handleTileClick(choice)}
                          disabled={isFound}
                          variant="outline"
                          className={`h-32 flex flex-col items-center justify-center gap-2 text-lg font-bold transition-all ${
                            isFound ? "bg-success/20 border-success" : ""
                          } ${isWrong ? "bg-destructive/20 border-destructive animate-shake" : ""}`}
                        >
                          <span className="text-5xl" role="img" aria-label={choice.word}>
                            {choice.emoji}
                          </span>
                          <span className="text-sm">{choice.word}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {feedback && (
                    <div className={`mt-4 text-center text-lg font-medium ${
                      feedbackType === "success" ? "text-success" : "text-destructive"
                    }`}>
                      {feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center space-y-6 max-w-lg mx-auto">
              <Award className="w-20 h-20 mx-auto text-primary animate-bounce" />
              <h3 className="text-3xl font-bold">Congratulations, {userName}!</h3>
              <p className="text-xl text-muted-foreground">
                You completed the Rhyme Match game!
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg">
                  <Star className="w-6 h-6 text-primary" />
                  <span className="font-bold">Total Points: {points}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-lg">
                  <span className="font-bold">⭐ Stars Earned: {stars} / {totalRounds}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RhymeGameMode;
