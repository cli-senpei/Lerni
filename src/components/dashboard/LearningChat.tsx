import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Star, Sparkles, Award, Mic, MicOff, Volume2, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BaselineGame from "./BaselineGame";
import FullGameMode from "./FullGameMode";
import RhymeGameMode from "./RhymeGameMode";

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
  const [showBaselineGame, setShowBaselineGame] = useState(false);
  const [baselineComplete, setBaselineComplete] = useState(false);
  const [userWeaknesses, setUserWeaknesses] = useState<string[]>([]);
  const [showFullGame, setShowFullGame] = useState(false);
  const [showRhymeGame, setShowRhymeGame] = useState(false);
  const [currentGameType, setCurrentGameType] = useState<"word-match" | "rhyme-match" | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      setUserId(user.id);

      // Check if user has existing profile
      const { data: profile } = await supabase
        .from('user_learning_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        // User has chatted before - restore state
        setUserName(profile.user_name);
        setBaselineComplete(profile.has_completed_baseline);
        setUserWeaknesses(profile.weaknesses || []);
        setPoints(profile.total_points || 0);
        setShowModeSelection(false);

        if (profile.has_completed_baseline) {
          setStep(2);
          // Skip straight to conversation
          addBotMessage(`Welcome back, ${profile.user_name}! Ready for another game?`, false);
        } else {
          // Continue from where they left off
          addBotMessage(`Hi my name is Lerni, what's your name?`, false);
        }
      }

      setIsLoadingProfile(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setIsLoadingProfile(false);
    }
  };

  const saveUserProfile = async (updates: Partial<{
    user_name: string;
    has_completed_baseline: boolean;
    baseline_score: number;
    weaknesses: string[];
    total_points: number;
  }>) => {
    if (!userId) return;

    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_learning_profiles')
        .select('user_name')
        .eq('user_id', userId)
        .maybeSingle();

      // Prepare upsert data - ensure user_name is always present
      const upsertData = {
        user_id: userId,
        user_name: updates.user_name || existingProfile?.user_name || 'User',
        ...updates,
        last_interaction_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_learning_profiles')
        .upsert(upsertData);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Failed to save progress",
        description: "Your progress might not be saved.",
        variant: "destructive",
      });
    }
  };

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
      addBotMessage("Hi my name is Lerni, what's your name?");
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

  const handleBaselineComplete = (score: number, weaknesses: string[]) => {
    setUserWeaknesses(weaknesses);
    setBaselineComplete(true);
    setShowBaselineGame(false);
    addPoints(50);
    
    // Determine which game to recommend based on weaknesses
    const hasRhymingWeakness = weaknesses.includes("basic-words") || score <= 3;
    setCurrentGameType(hasRhymingWeakness ? "rhyme-match" : "word-match");
    
    // Save to database
    saveUserProfile({
      has_completed_baseline: true,
      baseline_score: score,
      weaknesses,
      total_points: points + 50,
    });
    
    addBotMessage(`Great job! You got ${score} out of 6 correct!`);
    setTimeout(() => {
      const gameType = hasRhymingWeakness ? "Rhyme Match" : "Word Match";
      addBotMessage(`I've created a ${gameType} game just for you. Ready to play?`);
      setStep(2);
    }, 2000);
  };

  const handleConversationFlow = (userInput: string) => {
    if (step === 0) {
      setUserName(userInput);
      addPoints(10);
      
      // Save name to database
      saveUserProfile({
        user_name: userInput,
        total_points: points + 10,
      });
      
      addBotMessage(`Nice to meet you, ${userInput}!`);
      setTimeout(() => {
        addBotMessage(`Let's play a quick game to see what you're good at!`);
        setTimeout(() => {
          setShowBaselineGame(true);
          setStep(1);
        }, 1500);
      }, 2000);
    } else if (step === 2 && baselineComplete) {
      const response = userInput.toLowerCase().includes('yes');
      if (response) {
        addPoints(15);
        
        // Save updated points
        saveUserProfile({
          total_points: points + 15,
        });
        
        addBotMessage(`Awesome! Starting your game now...`);
        setTimeout(() => {
          if (currentGameType === "rhyme-match") {
            setShowRhymeGame(true);
          } else {
            setShowFullGame(true);
          }
        }, 2000);
      } else {
        addBotMessage(`No problem! Let me know when you're ready!`);
      }
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

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

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

  // Show rhyme game mode
  if (showRhymeGame) {
    return (
      <RhymeGameMode
        userName={userName}
        weaknesses={userWeaknesses}
        points={points}
        onPointsEarned={(amount) => {
          const newPoints = points + amount;
          setPoints(newPoints);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          // Save points to database
          saveUserProfile({ total_points: newPoints });
        }}
        onExitToChat={() => setShowRhymeGame(false)}
      />
    );
  }

  // Show full game mode
  if (showFullGame) {
    return (
      <FullGameMode
        userName={userName}
        weaknesses={userWeaknesses}
        points={points}
        onPointsEarned={(amount) => {
          const newPoints = points + amount;
          setPoints(newPoints);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          // Save points to database
          saveUserProfile({ total_points: newPoints });
        }}
        onExitToChat={() => setShowFullGame(false)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Compact Header - Points & Speech Controls */}
      <div className="w-full px-2 md:px-4 py-2 md:py-3 flex items-center justify-end gap-2 md:gap-3 border-b backdrop-blur-sm bg-background/50">
        {isSpeaking && (
          <Button
            onClick={toggleSpeech}
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-primary" />
          </Button>
        )}
        <div className="flex items-center gap-2 bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
          <Star className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <span className="text-base md:text-lg font-bold">{points}</span>
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
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 max-w-4xl mx-auto w-full">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2 md:py-3 ${
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
          
          {showBaselineGame && (
            <div className="animate-fade-in">
              <BaselineGame onComplete={handleBaselineComplete} />
            </div>
          )}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted px-3 md:px-4 py-2 md:py-3 border-l-4 border-muted-foreground/20">
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
      <div className="w-full px-3 md:px-6 py-3 md:py-4 border-t backdrop-blur-sm bg-background/50">
        <div className="max-w-4xl mx-auto">
          {isListening && (
            <div className="mb-2 md:mb-3 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm md:text-base font-medium">Listening...</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 md:gap-3">
            <Button 
              onClick={toggleVoiceInput}
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg ${
                isListening ? 'animate-pulse' : ''
              }`}
              disabled={isTyping}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Mic className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Speak now..." : "Type your answer..."}
              className="flex-1 h-10 md:h-12 text-sm md:text-base px-3 md:px-4 rounded-lg"
              disabled={isTyping || isListening}
            />
            <Button 
              onClick={handleSend}
              size="icon"
              className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
              disabled={isTyping || !input.trim() || isListening}
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningChat;
