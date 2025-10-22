import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Star, Sparkles, Award, Mic, MicOff, Volume2, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { askAI } from "@/lib/ai";
import BaselineGame from "./BaselineGame";
import RhymeGameMode from "./RhymeGameMode";
import PhonicsPopGame from "./PhonicsPopGame";
import PhaserGame from "./PhaserGame";
import ReadingGame from "./ReadingGame";
import { useSimpleAdaptiveAI } from "@/hooks/useSimpleAdaptiveAI";
import { getDifficultyString } from "@/lib/simpleAdaptiveAI";
import { usePointsTracker } from "@/hooks/usePointsTracker";
import ActivityOptions from "./ActivityOptions";

interface Message {
  text: string;
  isUser: boolean;
}

const LearningChat = () => {
  const { toast } = useToast();
  const { addPoints: trackPoints, incrementLesson, updateStreak } = usePointsTracker();
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
  const [showRhymeGame, setShowRhymeGame] = useState(false);
  const [showPhonicsGame, setShowPhonicsGame] = useState(false);
  const [showPhaserGame, setShowPhaserGame] = useState(false);
  const [showReadingGame, setShowReadingGame] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showActivityOptions, setShowActivityOptions] = useState(false);
  const [chatMode, setChatMode] = useState<'assessment' | 'game' | 'casual' | null>(null);
  const [pendingModeSwitch, setPendingModeSwitch] = useState(false);
  const [successfulResponses, setSuccessfulResponses] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize Simple Adaptive AI (no TensorFlow)
  const { 
    currentDifficulty, 
    focusArea,
    recordPerformance,
    getNextRecommendation 
  } = useSimpleAdaptiveAI();

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
          // Show activity options for returning users
          setShowActivityOptions(true);
        } else {
          // Continue from where they left off
          await addBotMessage(
            `Hey! What's your name? 😊`,
            false,
            false
          );
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
        .upsert(upsertData, { onConflict: 'user_id' });

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
      recognitionRef.current.interimResults = true; // Enable interim results to detect speaking
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        // Set recording to true when actually speaking (interim or final)
        setIsRecording(true);
        
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
          
        setInput(transcript);
        
        // Only process final results
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal) {
          setIsListening(false);
          setIsRecording(false);
          // Auto-submit the recording
          setTimeout(() => {
            setMessages(prev => [...prev, { text: transcript, isUser: true }]);
            setInput("");
            setTimeout(() => {
              handleConversationFlow(transcript);
              // Auto-restart listening if in mic mode
              if (preferredMode === 'mic') {
                setTimeout(() => {
                  if (recognitionRef.current && !isListening) {
                    setIsListening(true);
                    recognitionRef.current.start();
                  }
                }, 2000); // Wait 2s after bot responds
              }
            }, 600);
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
      // Handle errors conversationally with AI
        if (event.error === 'not-allowed' || event.error === 'no-speech') {
          addBotMessage(
            "There's a microphone problem. Explain it kindly to the child and offer to switch to keyboard mode.",
            true,
            true
          );
          setPendingModeSwitch(true);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
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
    
    // Simple initial greeting
    setTimeout(async () => {
      await addBotMessage(
        `Hey! What's your name? 😊`,
        true,
        false
      );
    }, 500);

    // Auto-start voice input if mic mode selected
    if (mode === 'mic') {
      setTimeout(() => {
        if (recognitionRef.current) {
          setIsListening(true);
          recognitionRef.current.start();
        }
      }, 2500);
    }
  };

  const handleActivitySelect = async (activity: 'assessment' | 'game' | 'casual') => {
    setShowActivityOptions(false);
    setChatMode(activity);

    if (activity === 'assessment') {
      await addBotMessage(`Let's do a quick check! Ready? 🎯`, true, false);
      setTimeout(() => {
        setShowBaselineGame(true);
      }, 1500);
    } else if (activity === 'game') {
      await addBotMessage(`Awesome! Let's pick a fun game! 🌟`, true, false);
      setTimeout(() => {
        const recommendation = getNextRecommendation();
        const focusCategory = recommendation.focus;
        
        // Map focus category to game
        if (focusCategory === 'rhyming') setShowRhymeGame(true);
        else if (focusCategory === 'phonics') setShowPhonicsGame(true);
        else if (focusCategory === 'word-recognition') setShowReadingGame(true);
        else setShowPhaserGame(true);
      }, 1500);
    } else {
      // Casual chat mode
      await addBotMessage(`Cool! What's on your mind? 💭`, true, false);
    }
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

  const getConversationContext = () => {
    const context: string[] = [];
    context.push(`User's name: ${userName || 'unknown'}`);
    context.push(`Current step: ${step === 0 ? 'asking for name' : step === 1 ? 'baseline assessment' : 'game selection'}`);
    context.push(`Baseline completed: ${baselineComplete ? 'yes' : 'no'}`);
    if (userWeaknesses.length > 0) {
      context.push(`Areas to focus on: ${userWeaknesses.join(', ')}`);
    }
    context.push(`Total points earned: ${points}`);
    context.push(`Preferred input mode: ${preferredMode || 'not set'}`);
    return context.join(' | ');
  };

  const addBotMessage = async (text: string, shouldSpeak = true, useAI = false) => {
    setIsTyping(true);
    
    let messageText = text;
    
    // Use AI to generate intelligent response if requested
    if (useAI) {
      try {
        const conversationHistory = messages
          .slice(-6) // Last 6 messages for context
          .map(m => `${m.isUser ? 'Child' : 'Lerni'}: ${m.text}`)
          .join('\n');
        
        const aiPrompt = `Context: ${getConversationContext()}
Recent conversation:
${conversationHistory}

${text}

Respond as Lerni (keep it to 1-2 sentences, encouraging and friendly):`;

        const aiResponse = await askAI(aiPrompt, userName, points);
        messageText = aiResponse || text;
      } catch (error) {
        console.error('AI error:', error);
        // Fallback to provided text
      }
    }
    
    setTimeout(() => {
      setMessages(prev => [...prev, { text: messageText, isUser: false }]);
      setIsTyping(false);
      
      // Speak the message after a brief delay
      if (shouldSpeak) {
        setTimeout(() => speak(messageText), 300);
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

  const handleBaselineComplete = async (score: number, weaknesses: string[]) => {
    setUserWeaknesses(weaknesses);
    setBaselineComplete(true);
    setShowBaselineGame(false);
    addPoints(50);
    
    saveUserProfile({
      has_completed_baseline: true,
      baseline_score: score,
      weaknesses,
      total_points: points + 50,
    });
    
    // Use AI for personalized feedback based on results
    const feedbackPrompt = `The child completed the assessment! Score: ${score}/5. They did great! Celebrate their effort briefly.`;
    await addBotMessage(feedbackPrompt, true, true);
    
    setTimeout(() => {
      // Show activity options after assessment
      setShowActivityOptions(true);
      setStep(2);
    }, 2000);
  };

  const handleConversationFlow = async (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    setSuccessfulResponses(prev => prev + 1);
    
    // Handle mode switch requests with AI
    if (preferredMode === 'mic' && (lowerInput.includes('keyboard') || lowerInput.includes('type'))) {
      setPendingModeSwitch(true);
      await addBotMessage(
        "The child wants to switch to keyboard. Ask them if they'd like to type instead of talking.",
        true,
        true
      );
      return;
    }
    
    if (pendingModeSwitch) {
      const confirmed = lowerInput.includes('yes') || lowerInput.includes('yeah') || lowerInput.includes('sure');
      if (confirmed) {
        setPendingModeSwitch(false);
        setPreferredMode('text');
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
        await addBotMessage("Confirm the switch to keyboard mode in a fun way!", true, true);
        return;
      } else {
        setPendingModeSwitch(false);
        await addBotMessage("They said no. Tell them we'll keep using voice in an encouraging way!", true, true);
        return;
      }
    }
    
    // Step 0: Getting child's name
    if (step === 0) {
      setUserName(userInput);
      addPoints(10);
      
      saveUserProfile({
        user_name: userInput,
        total_points: points + 10,
      });
      
      // Simple warm greeting with their name
      await addBotMessage(
        `Great to meet you, ${userInput}! Let's do a quick warm-up first. 🎮`,
        true,
        false
      );
      
      setTimeout(() => {
        setShowBaselineGame(true);
        setStep(1);
      }, 1500);
    } 
    // Step 2: After baseline OR casual chat mode
    else if (step === 2 || chatMode === 'casual') {
      // Use AI to respond naturally to user's message
      const conversationHistory = messages
        .slice(-4)
        .map(m => `${m.isUser ? 'Child' : 'Lerni'}: ${m.text}`)
        .join('\n');
      
      const aiPrompt = `Recent chat:\n${conversationHistory}\n\nChild said: "${userInput}"\n\nRespond naturally as Lerni. If they want to do something (play, learn, etc), suggest showing them options. Otherwise just chat friendly.`;
      
      await addBotMessage(aiPrompt, true, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleVoiceInput = async () => {
    if (!recognitionRef.current) {
      // Handle unsupported browsers through AI conversation
      await addBotMessage(
        "The browser doesn't support voice. Explain this to the child kindly and offer keyboard mode instead.",
        true,
        true
      );
      setPendingModeSwitch(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      setIsListening(true);
      setIsRecording(false);
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
          trackPoints(amount); // Track in database
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          // Save points to database
          saveUserProfile({ total_points: newPoints });
        }}
        onExitToChat={() => {
          setShowRhymeGame(false);
          incrementLesson(); // Count as completed lesson
          updateStreak(); // Update streak
        }}
        onPerformanceRecord={recordPerformance}
        currentDifficulty={getDifficultyString(currentDifficulty)}
      />
    );
  }

  // Show phonics pop game
  if (showPhonicsGame) {
    return (
      <PhonicsPopGame
        userName={userName}
        points={points}
        onPointsEarned={(amount) => {
          const newPoints = points + amount;
          setPoints(newPoints);
          trackPoints(amount); // Track in database
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          // Save points to database
          saveUserProfile({ total_points: newPoints });
        }}
        onExitToChat={() => {
          setShowPhonicsGame(false);
          incrementLesson(); // Count as completed lesson
          updateStreak(); // Update streak
        }}
        onPerformanceRecord={recordPerformance}
        currentDifficulty={getDifficultyString(currentDifficulty)}
      />
    );
  }

  // Show Reading game
  if (showReadingGame) {
    return (
      <ReadingGame
        onComplete={(score) => {
          const earnedPoints = score * 20; // 20 points per correct answer
          const newPoints = points + earnedPoints;
          setPoints(newPoints);
          trackPoints(earnedPoints);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          saveUserProfile({ total_points: newPoints });
          incrementLesson();
          updateStreak();
          setShowReadingGame(false);
        }}
      />
    );
  }

  // Show Phaser game
  if (showPhaserGame) {
    return (
      <PhaserGame
        userName={userName}
        points={points}
        gameType="word-catch"
        difficulty={getDifficultyString(currentDifficulty)}
        onPointsEarned={(amount) => {
          const newPoints = points + amount;
          setPoints(newPoints);
          trackPoints(amount); // Track in database
          setShowReward(true);
          setTimeout(() => setShowReward(false), 2000);
          
          // Save points to database
          saveUserProfile({ total_points: newPoints });
        }}
        onExitToChat={() => {
          setShowPhaserGame(false);
          incrementLesson(); // Count as completed lesson
          updateStreak(); // Update streak
        }}
        onPerformanceRecord={recordPerformance}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Compact Header - Points & Speech Controls */}
      <div className="w-full px-2 md:px-3 py-1 md:py-1.5 flex items-center justify-end gap-2 backdrop-blur-sm bg-background/50">
        {isSpeaking && (
          <Button
            onClick={toggleSpeech}
            variant="outline"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8 rounded-full"
          >
            <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </Button>
        )}
        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full">
          <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="text-sm md:text-base font-bold">{points}</span>
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
          
          {showActivityOptions && (
            <div className="animate-fade-in my-4">
              <ActivityOptions onSelectActivity={handleActivitySelect} userName={userName} />
            </div>
          )}
          
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
      {preferredMode === 'mic' ? (
        /* Mic Mode: Floating Layout */
        <>
          {/* Keyboard Switch Button - Bottom Left */}
            <Button
              onClick={() => setPreferredMode('text')}
              variant="ghost"
              size="sm"
              className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border shadow-lg text-muted-foreground hover:text-foreground transition-all animate-fade-in"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden md:inline">Keyboard</span>
            </Button>

            {/* Floating Mic Button - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 animate-fade-in">
              {/* Status Text Above Mic */}
              {isRecording && (
                <div className="animate-fade-in bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Speaking...</span>
                  </div>
                </div>
              )}
              
              {isListening && !isRecording && (
                <div className="animate-fade-in bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border">
                  <p className="text-sm text-muted-foreground">Listening...</p>
                </div>
              )}

              {/* Mic Button with Pulse Rings */}
              <div className="relative">
                {/* Outer pulse ring when recording */}
                {isRecording && (
                  <div className="absolute inset-0 -m-4">
                    <div className="w-full h-full rounded-full bg-primary/20 animate-ping" />
                  </div>
                )}
                
                {/* Inner glow when listening */}
                {isListening && (
                  <div className="absolute inset-0 -m-2">
                    <div className="w-full h-full rounded-full bg-primary/10 blur-lg animate-pulse" />
                  </div>
                )}
                
                {/* Mic Button */}
                <button
                  onClick={toggleVoiceInput}
                  className={`relative p-6 rounded-full shadow-2xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-primary text-primary-foreground shadow-primary/30' 
                      : 'bg-background/90 backdrop-blur-sm border-2 border-border hover:border-primary text-muted-foreground hover:text-primary'
                  } ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
                >
                  {isListening ? (
                    <Mic className="h-8 w-8" strokeWidth={2} />
                  ) : (
                    <MicOff className="h-8 w-8" strokeWidth={2} />
                  )}
                </button>
              </div>
              
              {/* Hint text when not active */}
              {!isListening && (
                <div className="animate-fade-in text-center bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border">
                  <p className="text-xs text-muted-foreground">Tap to speak</p>
                </div>
              )}
            </div>
          </>
      ) : (
        /* Text Mode: Normal Input */
        <div className="w-full px-3 md:px-6 py-3 md:py-4 border-t backdrop-blur-sm bg-background/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 md:gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                className="flex-1 h-10 md:h-12 text-sm md:text-base px-3 md:px-4 rounded-lg"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend}
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
                disabled={isTyping || !input.trim()}
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningChat;
