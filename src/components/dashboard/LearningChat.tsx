import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

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
    }, 800);
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
      // Capture name
      setUserName(userInput);
      addBotMessage(`Nice to meet you, ${userInput}! 😊`);
      setTimeout(() => {
        addBotMessage(`${userInput}, I'm here to make learning fun and easy for you. How are you feeling today?`);
        setStep(1);
      }, 2000);
    } else if (step === 1) {
      addBotMessage(`That's great to hear, ${userName}! I'm excited to help you on this journey.`);
      setTimeout(() => {
        addBotMessage(`${userName}, have you played learning games before? (Yes/No)`);
        setStep(2);
      }, 2000);
    } else if (step === 2) {
      const response = userInput.toLowerCase().includes('yes') 
        ? `Awesome, ${userName}! You're going to love what we have for you.`
        : `No worries, ${userName}! We'll take it step by step together.`;
      
      addBotMessage(response);
      setTimeout(() => {
        addBotMessage(`${userName}, are you ready to start your first interactive game? It's designed to help you learn while having fun! 🎮`);
        setStep(3);
      }, 2500);
    } else if (step === 3) {
      addBotMessage(`Perfect, ${userName}! Let's begin your adventure. Loading your personalized game now...`);
      setTimeout(() => {
        setStep(4);
        // Game will be loaded here
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 max-w-2xl w-full text-center space-y-4">
          <h2 className="text-3xl font-bold">Game Loading...</h2>
          <p className="text-muted-foreground">
            Great job, {userName}! Your game will appear here.
          </p>
          <div className="text-sm text-muted-foreground mt-4">
            (Waiting for game HTML script...)
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
      <Card className="w-full max-w-3xl h-[600px] flex flex-col shadow-2xl">
        <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-accent/10">
          <h2 className="text-2xl font-bold text-center">Your AI Learning Assistant</h2>
          <p className="text-sm text-center text-muted-foreground mt-1">
            Let's get to know each other!
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t bg-background">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 text-base"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend}
              size="icon"
              className="h-10 w-10"
              disabled={isTyping || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LearningChat;
