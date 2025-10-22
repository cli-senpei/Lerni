import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WordSortGameProps {
  userName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface WordItem {
  word: string;
  category: 'real' | 'fake';
}

const WordSortGame = ({ userName, difficulty, onComplete, onExit }: WordSortGameProps) => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    generateWords();
  }, [difficulty]);

  const generateWords = () => {
    const wordSets = {
      easy: {
        real: ['cat', 'dog', 'run', 'sit', 'big', 'red', 'sun', 'top'],
        fake: ['zop', 'gat', 'bop', 'wug', 'pim', 'tib', 'nep', 'lom']
      },
      medium: {
        real: ['jump', 'play', 'read', 'write', 'happy', 'quick', 'green', 'small'],
        fake: ['blip', 'trup', 'plag', 'strep', 'grint', 'plok', 'brat', 'flim']
      },
      hard: {
        real: ['explain', 'picture', 'question', 'friend', 'important', 'beautiful'],
        fake: ['blertain', 'priction', 'questlen', 'frimble', 'imporgant', 'beautimul']
      }
    };

    const set = wordSets[difficulty];
    const selectedReal = set.real.slice(0, 5).map(w => ({ word: w, category: 'real' as const }));
    const selectedFake = set.fake.slice(0, 5).map(w => ({ word: w, category: 'fake' as const }));
    
    const allWords = [...selectedReal, ...selectedFake].sort(() => Math.random() - 0.5);
    setWords(allWords);
  };

  const handleChoice = (choice: 'real' | 'fake') => {
    const correct = choice === words[currentIndex].category;
    setFeedback(correct ? 'correct' : 'incorrect');
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= words.length) {
        onComplete(score + (correct ? 1 : 0));
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1000);
  };

  if (words.length === 0) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Word Sort</h2>
          <Button onClick={onExit} variant="ghost">Exit</Button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            Word {currentIndex + 1} of {words.length}
          </p>
          <p className="text-sm text-muted-foreground">Score: {score}</p>
        </div>

        <div className="bg-muted rounded-lg p-12 text-center">
          <p className="text-5xl font-bold text-foreground">
            {words[currentIndex].word}
          </p>
        </div>

        <p className="text-center text-lg text-muted-foreground">
          Is this a real word or a made-up word?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleChoice('real')}
            size="lg"
            className="h-20 text-xl"
            disabled={feedback !== null}
          >
            Real Word
          </Button>
          <Button
            onClick={() => handleChoice('fake')}
            size="lg"
            variant="outline"
            className="h-20 text-xl"
            disabled={feedback !== null}
          >
            Made-Up Word
          </Button>
        </div>

        {feedback && (
          <div className={`text-center text-2xl font-bold animate-fade-in ${
            feedback === 'correct' ? 'text-green-500' : 'text-red-500'
          }`}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Try again next time!'}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WordSortGame;
