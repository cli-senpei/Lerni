import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Question {
  story: string;
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

const gameData: Question[] = [
  {
    story: "Once upon a time, in a magical forest, there lived a curious fox named Felix. Felix loved exploring and discovering new things. One sunny morning, he found a mysterious map near the old oak tree.",
    question: "What did Felix find near the old oak tree?",
    options: [
      { text: "A shiny coin", correct: false },
      { text: "A mysterious map", correct: true },
      { text: "A colorful feather", correct: false },
      { text: "A delicious berry", correct: false }
    ],
    explanation: "The story clearly states that Felix found 'a mysterious map near the old oak tree.'"
  },
  {
    story: "The map had strange symbols and drawings. Felix decided to follow the map to see where it would lead. He walked through tall grass, crossed a babbling brook, and climbed a small hill.",
    question: "What did Felix do after finding the map?",
    options: [
      { text: "He went back to sleep", correct: false },
      { text: "He followed the map", correct: true },
      { text: "He gave it to his friend", correct: false },
      { text: "He threw it away", correct: false }
    ],
    explanation: "The text says 'Felix decided to follow the map to see where it would lead.'"
  },
  {
    story: "After climbing the hill, Felix saw a beautiful rainbow-colored butterfly. It fluttered around him and then flew toward a hidden cave. Felix remembered the map showed a cave with a special treasure.",
    question: "What did Felix see after climbing the hill?",
    options: [
      { text: "A scary bear", correct: false },
      { text: "A rainbow-colored butterfly", correct: true },
      { text: "A talking tree", correct: false },
      { text: "A golden key", correct: false }
    ],
    explanation: "The passage mentions 'a beautiful rainbow-colored butterfly' after Felix climbed the hill."
  },
  {
    story: "Felix followed the butterfly into the cave. Inside, he found a chest filled with glowing crystals. The crystals lit up the dark cave with soft, colorful light.",
    question: "What was inside the chest in the cave?",
    options: [
      { text: "Gold coins", correct: false },
      { text: "Delicious food", correct: false },
      { text: "Glowing crystals", correct: true },
      { text: "Old books", correct: false }
    ],
    explanation: "The story explicitly states that the chest was 'filled with glowing crystals.'"
  },
  {
    story: "Felix took one small crystal as a souvenir. He decided to leave the rest for others to discover. As he left the cave, he realized the real treasure was the adventure itself.",
    question: "What did Felix realize was the real treasure?",
    options: [
      { text: "The gold coins", correct: false },
      { text: "The adventure itself", correct: true },
      { text: "The mysterious map", correct: false },
      { text: "The colorful butterfly", correct: false }
    ],
    explanation: "The text says Felix 'realized the real treasure was the adventure itself.'"
  }
];

const feedbackMessages = {
  correct: [
    "Excellent! You're paying close attention to the details in the story.",
    "Great job! You understood that part of the story perfectly.",
    "Well done! Your reading comprehension is really strong.",
    "Perfect! You're following the story very carefully."
  ],
  incorrect: [
    "Let's think about this again. The story says:",
    "I understand why you might think that, but the text actually says:",
    "That's a good guess, but if we look back at the story:",
    "Reading carefully is key here. The passage mentions:"
  ]
};

interface ReadingGameProps {
  onComplete: (score: number) => void;
}

const ReadingGame = ({ onComplete }: ReadingGameProps) => {
  const [gameState, setGameState] = useState<"welcome" | "playing" | "result">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startGame = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const selectOption = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const isCorrect = gameData[currentQuestion].options[index].correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < gameData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setGameState("result");
      onComplete(score);
    }
  };

  const restartGame = () => {
    setGameState("welcome");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const renderStars = () => {
    const starPercentage = score / gameData.length;
    const filledStars = Math.round(starPercentage * 5);
    
    return (
      <div className="flex gap-2 justify-center my-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-12 w-12 ${
              i < filledStars ? "fill-yellow-500 text-yellow-500" : "fill-none text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const getFinalFeedback = () => {
    if (score === gameData.length) {
      return "Perfect score! Your reading comprehension is outstanding. You're paying excellent attention to details and understanding the story completely. Keep up the fantastic work!";
    } else if (score >= gameData.length * 0.7) {
      return "Great job! You're showing strong reading comprehension skills. You understand most of the story details. With a little more practice on paying attention to specific details, you'll be getting perfect scores!";
    } else if (score >= gameData.length * 0.5) {
      return "Good effort! You're understanding the main ideas of the story. Try to focus more on the specific details mentioned in the text. Reading each paragraph twice can help you catch important information.";
    } else {
      return "Nice try! Reading comprehension takes practice. I recommend reading each passage slowly and making sure you understand each sentence before moving to the questions. Try to match each answer option directly with what's stated in the story.";
    }
  };

  if (gameState === "welcome") {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-6xl">🦊</div>
          </div>
          <h2 className="text-3xl font-bold text-primary">Welcome to Reading Adventure!</h2>
          <p className="text-lg text-muted-foreground">
            Improve your reading skills with fun stories and challenges. Perfect for both kids and adults!
          </p>
          <p className="text-muted-foreground">
            Read the story, answer questions, and earn stars for correct answers.
          </p>
          <p className="font-semibold text-accent">
            New: Get AI-powered feedback to help you improve!
          </p>
          <Button onClick={startGame} size="lg" className="px-8">
            Start Reading Adventure
          </Button>
        </div>
      </Card>
    );
  }

  if (gameState === "playing") {
    const currentQ = gameData[currentQuestion];
    const isCorrect = selectedOption !== null && currentQ.options[selectedOption].correct;
    const randomMessage = selectedOption !== null 
      ? (isCorrect 
        ? feedbackMessages.correct[Math.floor(Math.random() * feedbackMessages.correct.length)]
        : feedbackMessages.incorrect[Math.floor(Math.random() * feedbackMessages.incorrect.length)])
      : "";

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <p className="text-lg leading-relaxed">{currentQ.story}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">{currentQ.question}</h3>
          
          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectOption(index)}
                disabled={selectedOption !== null}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedOption === null
                    ? "border-border hover:border-primary hover:bg-primary/5"
                    : selectedOption === index
                    ? option.correct
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                    : option.correct && selectedOption !== null
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border opacity-50"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          {showFeedback && selectedOption !== null && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-primary mb-4">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                🤖 AI Reading Assistant
              </h4>
              <p className="text-sm mb-2">{randomMessage}</p>
              {isCorrect ? (
                <p className="text-sm">
                  <strong>Why this is correct:</strong> {currentQ.explanation}
                </p>
              ) : (
                <>
                  <p className="text-sm mb-2">{currentQ.explanation}</p>
                  <p className="text-sm">
                    You selected "{currentQ.options[selectedOption].text}", but the correct answer was in the text.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Tip:</strong> Try reading each option carefully and matching it with what the story says.
                  </p>
                </>
              )}
            </Card>
          )}

          <div className="space-y-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / gameData.length) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {gameData.length}</span>
              <span>Score: {score}</span>
            </div>
          </div>

          {showFeedback && (
            <Button onClick={nextQuestion} className="w-full mt-4">
              {currentQuestion + 1 < gameData.length ? "Next Question" : "See Results"}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <div className="text-6xl">🦊</div>
        </div>
        
        <h2 className="text-3xl font-bold text-primary">Congratulations!</h2>
        <p className="text-lg text-muted-foreground">You've completed the reading adventure!</p>
        
        <div className="text-6xl font-bold text-primary">
          {score}/{gameData.length}
        </div>
        
        {renderStars()}
        
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-primary text-left">
          <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
            🤖 AI Feedback
          </h3>
          <p className="text-sm leading-relaxed">{getFinalFeedback()}</p>
        </Card>
        
        <Button onClick={restartGame} size="lg" className="px-8">
          Play Again
        </Button>
      </div>
    </Card>
  );
};

export default ReadingGame;
