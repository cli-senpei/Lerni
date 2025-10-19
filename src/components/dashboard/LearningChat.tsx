import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Star, Sparkles, Award, Mic, MicOff, Volume2, MessageSquare, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  text: string;
  isUser: boolean;
}

const LearningChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [preferredMode, setPreferredMode] = useState<'mic' | 'text' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-submit the recording
        setTimeout(() => {
          setMessages(prev => [...prev, { text: transcript, isUser: true }]);
          setTimeout(() => {
            handleConversationFlow(transcript);
          }, 600);
        }, 100);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again or type your response.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startChat = (mode: 'mic' | 'text') => {
    setPreferredMode(mode);
    setShowModeSelection(false);
    
    // Initial welcome message
    setTimeout(() => {
      addBotMessage("Hi! Welcome!");
      setTimeout(() => {
        addBotMessage("What's your name?");
      }, 1500);
    }, 500);
  };

  const speak = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for dyslexic-friendly
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const addBotMessage = (text: string, shouldSpeak = true) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text, isUser: false }]);
      setIsTyping(false);
      
      // Speak the message after a brief delay
      if (shouldSpeak) {
        setTimeout(() => speak(text), 300);
      }
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
      addBotMessage(`Nice to meet you, ${userInput}!`);
      setTimeout(() => {
        addBotMessage(`How are you feeling today?`);
        setStep(1);
      }, 2000);
    } else if (step === 1) {
      addPoints(10);
      addBotMessage(`Great! I'm here to help you.`);
      setTimeout(() => {
        addBotMessage(`Ready to play a game? Yes or No`);
        setStep(2);
      }, 2000);
    } else if (step === 2) {
      addPoints(15);
      const response = userInput.toLowerCase().includes('yes') 
        ? `Awesome! You'll love this.`
        : `No worries! We'll go slow.`;
      
      addBotMessage(response);
      setTimeout(() => {
        addBotMessage(`Let's start! Ready?`);
        setStep(3);
      }, 2000);
    } else if (step === 3) {
      addPoints(25);
      addBotMessage(`Perfect! Loading your game...`);
      setTimeout(() => {
        setStep(4);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your response.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Mode selection screen
  if (showModeSelection) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-3">How do you want to chat?</h2>
            <p className="text-lg text-muted-foreground">Choose your preferred way to communicate</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => startChat('mic')}
              size="lg"
              className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90"
            >
              <Mic className="w-6 h-6 mr-3" />
              Use Microphone
            </Button>
            
            <Button
              onClick={() => startChat('text')}
              size="lg"
              variant="outline"
              className="w-full h-20 text-xl font-bold border-2"
            >
              <Keyboard className="w-6 h-6 mr-3" />
              Type Messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8 p-8">
          <div className="animate-pulse">
            <Sparkles className="w-24 h-24 mx-auto text-primary animate-bounce" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-wider animate-fade-in">
            Loading Your Game
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light tracking-wide animate-fade-in">
            Great job, {userName}!
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
    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Gamified Header */}
      <div className="w-full px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 animate-fade-in">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Learning Helper</h2>
            <p className="text-sm md:text-base text-muted-foreground">Let's go!</p>
          </div>
        </div>
        
        {/* Points Display & Speech Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {isSpeaking && (
            <Button
              onClick={toggleSpeech}
              variant="outline"
              size="icon"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-primary/20"
            >
              <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </Button>
          )}
          <div className="flex items-center gap-2 md:gap-3 bg-primary/10 px-3 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/20">
            <Star className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            <span className="text-lg md:text-2xl font-bold">{points}</span>
          </div>
        </div>
      </div>

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <Award className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-xl md:text-2xl font-bold">+{step === 0 ? 10 : step === 1 ? 10 : step === 2 ? 15 : 25} Points!</span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-12 max-w-5xl mx-auto w-full">
        <div className="space-y-4 md:space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-4 md:px-6 py-3 md:py-4 ${
                  message.isUser
                    ? 'bg-primary/10 text-foreground border-l-4 border-primary'
                    : 'bg-muted text-foreground border-l-4 border-muted-foreground/20'
                }`}
              >
                <p className="text-base md:text-lg leading-relaxed">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted px-4 md:px-6 py-3 md:py-4 border-l-4 border-muted-foreground/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full px-4 md:px-8 py-4 md:py-6 border-t backdrop-blur-sm bg-background/50">
        <div className="max-w-4xl mx-auto">
          {isListening && (
            <div className="mb-3 md:mb-4 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 md:gap-3 bg-primary/10 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary/20">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-sm md:text-lg font-medium">Listening...</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 md:gap-4">
            <Button 
              onClick={toggleVoiceInput}
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`h-12 w-12 md:h-16 md:w-16 rounded-xl shadow-lg hover:scale-110 transition-all ${
                isListening ? 'animate-pulse' : ''
              }`}
              disabled={isTyping}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Mic className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Speak now..." : "Type your answer..."}
              className="flex-1 h-12 md:h-16 text-base md:text-lg px-4 md:px-6 rounded-xl border-2 border-primary/20 focus:border-primary transition-all"
              disabled={isTyping || isListening}
            />
            <Button 
              onClick={handleSend}
              size="icon"
              className="h-12 w-12 md:h-16 md:w-16 rounded-xl shadow-lg hover:scale-110 transition-all"
              disabled={isTyping || !input.trim() || isListening}
            >
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningChat;
