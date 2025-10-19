import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Star, Sparkles, Award } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

const LearningChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial welcome message
    setTimeout(() => {
      addBotMessage("Hello! Welcome to your personalized learning experience. 🎉");
      setTimeout(() => {
        addBotMessage("Before we begin, what's your name?");
      }, 1500);
    }, 500);
  }, []);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text, isUser: false }]);
      setIsTyping(false);
    }, 1200);
  };

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isUser: true }]);
    const userInput = input;
    setInput("");

    setTimeout(() => {
      handleConversationFlow(userInput);
    }, 600);
  };

  const handleConversationFlow = (userInput: string) => {
    if (step === 0) {
      setUserName(userInput);
      addPoints(10);
      addBotMessage(`Nice to meet you, ${userInput}! 😊`);
      setTimeout(() => {
        addBotMessage(`${userInput}, I'm here to make learning fun and easy for you. How are you feeling today?`);
        setStep(1);
      }, 2500);
    } else if (step === 1) {
      addPoints(10);
      addBotMessage(`That's great to hear, ${userName}! I'm excited to help you on this journey.`);
      setTimeout(() => {
        addBotMessage(`${userName}, have you played learning games before? (Yes/No)`);
        setStep(2);
      }, 2500);
    } else if (step === 2) {
      addPoints(15);
      const response = userInput.toLowerCase().includes('yes') 
        ? `Awesome, ${userName}! You're going to love what we have for you.`
        : `No worries, ${userName}! We'll take it step by step together.`;
      
      addBotMessage(response);
      setTimeout(() => {
        addBotMessage(`${userName}, are you ready to start your first interactive game? It's designed to help you learn while having fun! 🎮`);
        setStep(3);
      }, 3000);
    } else if (step === 3) {
      addPoints(25);
      addBotMessage(`Perfect, ${userName}! Let's begin your adventure. Loading your personalized game now...`);
      setTimeout(() => {
        setStep(4);
      }, 2500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8 p-8">
          <div className="animate-pulse">
            <Sparkles className="w-24 h-24 mx-auto text-primary animate-bounce" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-wider animate-fade-in">
            Loading Your Game
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light tracking-wide animate-fade-in">
            Great job, {userName}! 🎮
          </p>
          <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground animate-fade-in">
            <Award className="w-6 h-6 text-primary" />
            <span>You earned {points} points!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Gamified Header */}
      <div className="w-full px-8 py-6 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Learning Assistant</h2>
            <p className="text-base md:text-lg text-muted-foreground font-light">Let's get started!</p>
          </div>
        </div>
        
        {/* Points Display */}
        <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full border-2 border-primary/20">
          <Star className="w-6 h-6 text-primary animate-pulse" />
          <span className="text-2xl font-bold">{points}</span>
        </div>
      </div>

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <Award className="w-8 h-8" />
            <span className="text-2xl font-bold">+{step === 0 ? 10 : step === 1 ? 10 : step === 2 ? 15 : 25} Points!</span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-12 max-w-5xl mx-auto w-full">
        <div className="space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[75%] px-8 py-6 rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border-2 border-primary/10'
                }`}
              >
                <p className="text-xl md:text-2xl leading-relaxed tracking-wide font-light" style={{ lineHeight: '2' }}>
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-card border-2 border-primary/10 px-8 py-6 rounded-3xl shadow-lg">
                <div className="flex gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full px-8 py-6 border-t backdrop-blur-sm bg-background/50">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            className="flex-1 h-16 text-xl md:text-2xl px-6 rounded-2xl border-2 border-primary/20 focus:border-primary transition-all font-light tracking-wide"
            style={{ letterSpacing: '0.05em' }}
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend}
            size="icon"
            className="h-16 w-16 rounded-2xl shadow-lg hover:scale-110 transition-all"
            disabled={isTyping || !input.trim()}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningChat;
