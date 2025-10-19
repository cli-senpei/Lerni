import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePointsTracker } from "@/hooks/usePointsTracker";

interface BaselineGameProps {
  onComplete: (score: number, weaknesses: string[]) => void;
}

const QUESTIONS = [
  { 
    type: "spell",
    word: "cat", 
    prompt: "Spell the word",
    difficulty: "easy" 
  },
  { 
    type: "visual",
    word: "dog",
    prompt: "Which letters spell 'dog'?",
    difficulty: "easy" 
  },
  { 
    type: "interactive",
    word: "run",
    prompt: "Tap the letters to spell what you do fast",
    difficulty: "easy" 
  },
];

const BaselineGame = ({ onComplete }: BaselineGameProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<{ [key: string]: number }>({});
  const gameRef = useRef<HTMLDivElement>(null);
  const { addPoints, incrementLesson } = usePointsTracker();

  const currentQuestion = QUESTIONS[currentWordIndex];

  useEffect(() => {
    // Shuffle letters for the current question
    const letters = currentQuestion.word.split("");
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
    setSelectedLetters([]);
    
    // Scroll game into view centered in chat
    setTimeout(() => {
      gameRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }, 100);
  }, [currentWordIndex]);

  const handleLetterClick = (letter: string, index: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);

    const newShuffled = shuffledLetters.filter((_, i) => i !== index);
    setShuffledLetters(newShuffled);

    // Check if word is complete
    if (newSelected.length === currentQuestion.word.length) {
      const formedWord = newSelected.join("");
      if (formedWord === currentQuestion.word) {
        setScore(score + 1);
        addPoints(10); // Award 10 points per correct answer
        setTimeout(moveToNext, 800);
      } else {
        // Track mistakes by difficulty
        setMistakes({
          ...mistakes,
          [currentQuestion.difficulty]: (mistakes[currentQuestion.difficulty] || 0) + 1,
        });
        // Reset after wrong attempt
        setTimeout(() => {
          setShuffledLetters(currentQuestion.word.split("").sort(() => Math.random() - 0.5));
          setSelectedLetters([]);
        }, 800);
      }
    }
  };

  const moveToNext = () => {
    if (currentWordIndex < QUESTIONS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Game complete - analyze weaknesses
      const weaknesses: string[] = [];
      if ((mistakes.easy || 0) > 0) weaknesses.push("phonics");
      
      incrementLesson(); // Count as completed lesson
      onComplete(score, weaknesses.length > 0 ? weaknesses : ["none"]);
    }
  };

  const isCorrect = selectedLetters.length === currentQuestion.word.length && 
                    selectedLetters.join("") === currentQuestion.word;
  const isWrong = selectedLetters.length === currentQuestion.word.length && 
                  selectedLetters.join("") !== currentQuestion.word;

  return (
    <Card ref={gameRef} className="p-4 md:p-6 bg-background border-2 border-primary/20">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Question {currentWordIndex + 1} of {QUESTIONS.length}
          </p>
          <p className="text-base md:text-lg font-medium mb-4">
            {currentQuestion.prompt}: <span className="font-bold text-primary">{currentQuestion.word}</span>
          </p>
        </div>

        {/* Selected letters display */}
        <div className="flex justify-center gap-2 min-h-[60px] items-center flex-wrap">
          {selectedLetters.map((letter, index) => (
            <div
              key={index}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold ${
                isCorrect
                  ? "bg-green-500/20 text-green-700 border-2 border-green-500"
                  : isWrong
                  ? "bg-red-500/20 text-red-700 border-2 border-red-500"
                  : "bg-primary/10 text-foreground border-2 border-primary/30"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Shuffled letters to choose from */}
        <div className="flex justify-center gap-2 flex-wrap">
          {shuffledLetters.map((letter, index) => (
            <Button
              key={index}
              onClick={() => handleLetterClick(letter, index)}
              className="w-12 h-12 md:w-14 md:h-14 text-xl md:text-2xl font-bold"
              variant="outline"
            >
              {letter}
            </Button>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Score: {score} / {QUESTIONS.length}
        </div>
      </div>
    </Card>
  );
};

export default BaselineGame;
