import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BaselineGameProps {
  onComplete: (score: number, weaknesses: string[]) => void;
}

const WORDS = [
  { word: "cat", difficulty: "easy" },
  { word: "dog", difficulty: "easy" },
  { word: "run", difficulty: "easy" },
  { word: "jump", difficulty: "medium" },
  { word: "play", difficulty: "medium" },
  { word: "friend", difficulty: "hard" },
];

const BaselineGame = ({ onComplete }: BaselineGameProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<{ [key: string]: number }>({});
  const gameRef = useRef<HTMLDivElement>(null);

  const currentWord = WORDS[currentWordIndex];

  useEffect(() => {
    // Shuffle letters for the current word
    const letters = currentWord.word.split("");
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
    if (newSelected.length === currentWord.word.length) {
      const formedWord = newSelected.join("");
      if (formedWord === currentWord.word) {
        setScore(score + 1);
        setTimeout(moveToNext, 800);
      } else {
        // Track mistakes by difficulty
        setMistakes({
          ...mistakes,
          [currentWord.difficulty]: (mistakes[currentWord.difficulty] || 0) + 1,
        });
        // Reset after wrong attempt
        setTimeout(() => {
          setShuffledLetters(currentWord.word.split("").sort(() => Math.random() - 0.5));
          setSelectedLetters([]);
        }, 800);
      }
    }
  };

  const moveToNext = () => {
    if (currentWordIndex < WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Game complete - analyze weaknesses
      const weaknesses: string[] = [];
      if ((mistakes.easy || 0) > 1) weaknesses.push("basic-words");
      if ((mistakes.medium || 0) > 1) weaknesses.push("medium-words");
      if ((mistakes.hard || 0) > 1) weaknesses.push("complex-words");
      
      onComplete(score, weaknesses.length > 0 ? weaknesses : ["none"]);
    }
  };

  const isCorrect = selectedLetters.length === currentWord.word.length && 
                    selectedLetters.join("") === currentWord.word;
  const isWrong = selectedLetters.length === currentWord.word.length && 
                  selectedLetters.join("") !== currentWord.word;

  return (
    <Card ref={gameRef} className="p-4 md:p-6 bg-background border-2 border-primary/20">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Word {currentWordIndex + 1} of {WORDS.length}
          </p>
          <p className="text-base md:text-lg font-medium mb-4">
            Spell the word: <span className="font-bold text-primary">{currentWord.word}</span>
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
          Score: {score} / {WORDS.length}
        </div>
      </div>
    </Card>
  );
};

export default BaselineGame;
