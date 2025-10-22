import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LetterMatchGameProps {
  userName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface LetterPair {
  uppercase: string;
  lowercase: string;
}

const LetterMatchGame = ({ userName, difficulty, onComplete, onExit }: LetterMatchGameProps) => {
  const [pairs, setPairs] = useState<LetterPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    generatePairs();
  }, [difficulty]);

  const generatePairs = () => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const count = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 15;
    const selected = allLetters.slice(0, count);
    
    const letterPairs = selected.map(letter => ({
      uppercase: letter,
      lowercase: letter.toLowerCase()
    }));

    setPairs(letterPairs);
    generateOptions(0, letterPairs);
  };

  const generateOptions = (index: number, pairsList: LetterPair[]) => {
    const correct = pairsList[index].lowercase;
    const allOptions = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const wrong = allOptions
      .filter(l => l !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const opts = [correct, ...wrong].sort(() => Math.random() - 0.5);
    setOptions(opts);
  };

  const handleChoice = (choice: string) => {
    const correct = choice === pairs[currentIndex].lowercase;
    setFeedback(correct ? 'correct' : 'incorrect');
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= pairs.length) {
        onComplete(score + (correct ? 1 : 0));
      } else {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        generateOptions(nextIndex, pairs);
      }
    }, 1000);
  };

  if (pairs.length === 0) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Letter Match</h2>
          <Button onClick={onExit} variant="ghost">Exit</Button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            Letter {currentIndex + 1} of {pairs.length}
          </p>
          <p className="text-sm text-muted-foreground">Score: {score}</p>
        </div>

        <div className="bg-muted rounded-lg p-16 text-center">
          <p className="text-8xl font-bold text-foreground">
            {pairs[currentIndex].uppercase}
          </p>
        </div>

        <p className="text-center text-lg text-muted-foreground">
          Which lowercase letter matches?
        </p>

        <div className="grid grid-cols-2 gap-4">
          {options.map((letter, idx) => (
            <Button
              key={idx}
              onClick={() => handleChoice(letter)}
              size="lg"
              variant="outline"
              className="h-24 text-4xl"
              disabled={feedback !== null}
            >
              {letter}
            </Button>
          ))}
        </div>

        {feedback && (
          <div className={`text-center text-2xl font-bold animate-fade-in ${
            feedback === 'correct' ? 'text-green-500' : 'text-red-500'
          }`}>
            {feedback === 'correct' ? '✓ Great job!' : '✗ Keep trying!'}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LetterMatchGame;
