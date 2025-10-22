import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePointsTracker } from "@/hooks/usePointsTracker";

interface BaselineGameProps {
  onComplete: (score: number, weaknesses: string[]) => void;
}

type QuestionType = 
  | { type: "color-memory"; colors: string[]; correctSequence: string[]; prompt: string }
  | { type: "pattern"; sequence: string[]; options: string[]; answer: string; prompt: string }
  | { type: "spell"; word: string; prompt: string }
  | { type: "reading"; story: string; question: string; options: string[]; answer: string; prompt: string }
  | { type: "emotion"; scenario: string; options: string[]; answer: string; prompt: string };

const QUESTIONS: QuestionType[] = [
  { 
    type: "color-memory",
    colors: ["🔴", "🟢", "🔵"],
    correctSequence: ["🔴", "🟢", "🔵"],
    prompt: "Remember the color order, then tap them in the same order!"
  },
  { 
    type: "pattern",
    sequence: ["🔵", "🟢", "🔵", "🟢", "🔵"],
    options: ["🟢", "🔵", "🔴"],
    answer: "🟢",
    prompt: "What comes next in the pattern?"
  },
  { 
    type: "spell",
    word: "cat",
    prompt: "Tap the letters to spell"
  },
  { 
    type: "reading",
    story: "Tom went to the park. He saw a big dog. The dog was friendly.",
    question: "Where did Tom go?",
    options: ["store", "park", "school"],
    answer: "park",
    prompt: "Read the story and answer the question"
  },
  { 
    type: "emotion",
    scenario: "Your friend lost their toy and looks sad 😢",
    options: ["Laugh at them", "Give them a hug", "Take another toy"],
    answer: "Give them a hug",
    prompt: "What would you do?"
  },
];

const BaselineGame = ({ onComplete }: BaselineGameProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [showColors, setShowColors] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [mistakes, setMistakes] = useState<{ [key: string]: number }>({});
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const { addPoints, incrementLesson } = usePointsTracker();

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    setSelectedLetters([]);
    setColorSequence([]);
    setSelectedAnswer("");
    setFeedback(null);
    
    if (currentQuestion.type === "spell") {
      const letters = currentQuestion.word.split("");
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setShuffledLetters(shuffled);
    } else if (currentQuestion.type === "color-memory") {
      setShowColors(true);
      setTimeout(() => setShowColors(false), 3000);
    }
    
    setTimeout(() => {
      gameRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }, 100);
  }, [currentQuestionIndex]);

  const handleLetterClick = (letter: string, index: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    const newShuffled = shuffledLetters.filter((_, i) => i !== index);
    setShuffledLetters(newShuffled);

    if (currentQuestion.type === "spell" && newSelected.length === currentQuestion.word.length) {
      const formedWord = newSelected.join("");
      if (formedWord === currentQuestion.word) {
        setFeedback("correct");
        setScore(score + 1);
        addPoints(20);
        setTimeout(moveToNext, 1200);
      } else {
        setFeedback("wrong");
        setMistakes({ ...mistakes, phonics: (mistakes.phonics || 0) + 1 });
        setTimeout(() => {
          setShuffledLetters(currentQuestion.word.split("").sort(() => Math.random() - 0.5));
          setSelectedLetters([]);
          setFeedback(null);
        }, 1200);
      }
    }
  };

  const handleColorClick = (color: string) => {
    if (currentQuestion.type !== "color-memory") return;
    const newSequence = [...colorSequence, color];
    setColorSequence(newSequence);

    if (newSequence.length === currentQuestion.correctSequence.length) {
      const isCorrect = newSequence.every((c, i) => c === currentQuestion.correctSequence[i]);
      if (isCorrect) {
        setFeedback("correct");
        setScore(score + 1);
        addPoints(20);
        setTimeout(moveToNext, 1200);
      } else {
        setFeedback("wrong");
        setMistakes({ ...mistakes, memory: (mistakes.memory || 0) + 1 });
        setTimeout(() => {
          setColorSequence([]);
          setFeedback(null);
        }, 1200);
      }
    }
  };

  const handleMultipleChoice = (answer: string) => {
    setSelectedAnswer(answer);
    let isCorrect = false;
    
    if (currentQuestion.type === "pattern") {
      isCorrect = answer === currentQuestion.answer;
      if (!isCorrect) setMistakes({ ...mistakes, pattern: (mistakes.pattern || 0) + 1 });
    } else if (currentQuestion.type === "reading") {
      isCorrect = answer === currentQuestion.answer;
      if (!isCorrect) setMistakes({ ...mistakes, reading: (mistakes.reading || 0) + 1 });
    } else if (currentQuestion.type === "emotion") {
      isCorrect = answer === currentQuestion.answer;
      if (!isCorrect) setMistakes({ ...mistakes, emotion: (mistakes.emotion || 0) + 1 });
    }

    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore(score + 1);
      addPoints(20);
    }
    setTimeout(moveToNext, 1200);
  };

  const moveToNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const weaknesses: string[] = [];
      if ((mistakes.phonics || 0) > 0) weaknesses.push("phonics");
      if ((mistakes.memory || 0) > 0) weaknesses.push("memory");
      if ((mistakes.pattern || 0) > 0) weaknesses.push("pattern");
      if ((mistakes.reading || 0) > 0) weaknesses.push("reading");
      if ((mistakes.emotion || 0) > 0) weaknesses.push("empathy");
      
      incrementLesson();
      onComplete(score, weaknesses.length > 0 ? weaknesses : ["none"]);
    }
  };

  return (
    <Card ref={gameRef} className="p-4 md:p-6 bg-background border-2 border-primary/20">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Challenge {currentQuestionIndex + 1} of {QUESTIONS.length}
          </p>
          <p className="text-base md:text-lg font-medium mb-4">
            {currentQuestion.prompt}
          </p>
        </div>

        {/* Color Memory Game */}
        {currentQuestion.type === "color-memory" && (
          <div className="space-y-4">
            {showColors ? (
              <div className="flex justify-center gap-3">
                {currentQuestion.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-4xl animate-bounce"
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    {color}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center gap-2 min-h-[60px]">
                  {colorSequence.map((color, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl bg-primary/10 border-2 border-primary/30">
                      {color}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  {currentQuestion.colors.map((color, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleColorClick(color)}
                      className="w-16 h-16 text-4xl p-0"
                      variant="outline"
                      disabled={feedback !== null}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pattern Recognition */}
        {currentQuestion.type === "pattern" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {currentQuestion.sequence.map((item, idx) => (
                <div key={idx} className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl bg-muted">
                  {item}
                </div>
              ))}
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl bg-primary/10 border-2 border-dashed border-primary">
                ?
              </div>
            </div>
            <div className="flex justify-center gap-3">
              {currentQuestion.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleMultipleChoice(option)}
                  className={`w-16 h-16 text-4xl p-0 ${
                    selectedAnswer === option && feedback === "correct" ? "bg-green-500 hover:bg-green-600" :
                    selectedAnswer === option && feedback === "wrong" ? "bg-red-500 hover:bg-red-600" : ""
                  }`}
                  variant="outline"
                  disabled={feedback !== null}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Spelling Game */}
        {currentQuestion.type === "spell" && (
          <>
            <div className="text-center text-2xl font-bold text-primary mb-2">
              {currentQuestion.word}
            </div>
            <div className="flex justify-center gap-2 min-h-[60px] items-center flex-wrap">
              {selectedLetters.map((letter, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold ${
                    feedback === "correct" ? "bg-green-500/20 text-green-700 border-2 border-green-500" :
                    feedback === "wrong" ? "bg-red-500/20 text-red-700 border-2 border-red-500" :
                    "bg-primary/10 text-foreground border-2 border-primary/30"
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {shuffledLetters.map((letter, index) => (
                <Button
                  key={index}
                  onClick={() => handleLetterClick(letter, index)}
                  className="w-12 h-12 md:w-14 md:h-14 text-xl md:text-2xl font-bold"
                  variant="outline"
                  disabled={feedback !== null}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Reading Comprehension */}
        {currentQuestion.type === "reading" && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <p className="text-base md:text-lg leading-relaxed">
                {currentQuestion.story}
              </p>
            </Card>
            <p className="text-lg font-medium text-center">{currentQuestion.question}</p>
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleMultipleChoice(option)}
                  className={`w-full h-12 text-lg ${
                    selectedAnswer === option && feedback === "correct" ? "bg-green-500 hover:bg-green-600" :
                    selectedAnswer === option && feedback === "wrong" ? "bg-red-500 hover:bg-red-600" : ""
                  }`}
                  variant="outline"
                  disabled={feedback !== null}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Emotion Recognition */}
        {currentQuestion.type === "emotion" && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50 text-center">
              <p className="text-lg md:text-xl">{currentQuestion.scenario}</p>
            </Card>
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleMultipleChoice(option)}
                  className={`w-full h-14 text-base ${
                    selectedAnswer === option && feedback === "correct" ? "bg-green-500 hover:bg-green-600" :
                    selectedAnswer === option && feedback === "wrong" ? "bg-red-500 hover:bg-red-600" : ""
                  }`}
                  variant="outline"
                  disabled={feedback !== null}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground pt-2">
          Score: {score} / {QUESTIONS.length}
        </div>
      </div>
    </Card>
  );
};

export default BaselineGame;
