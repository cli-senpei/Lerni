import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Loader2, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AIAssistantPanelProps {
  gameName: string;
  gameCode: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AISettings {
  persona: string;
  tone: string;
  verbosity: number;
  focus: string;
}

const AIAssistantPanel = ({ gameName, gameCode }: AIAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AISettings>({
    persona: 'expert',
    tone: 'professional',
    verbosity: 5,
    focus: 'code_review'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildSystemPrompt = () => {
    const personaMap = {
      expert: "You are an expert game developer and code reviewer with years of experience.",
      mentor: "You are a patient mentor who explains concepts clearly and encourages learning.",
      critic: "You are a critical code reviewer who spots issues and suggests improvements.",
      creative: "You are a creative game designer who thinks outside the box and suggests innovative ideas."
    };

    const toneMap = {
      professional: "Maintain a professional and technical tone.",
      friendly: "Be friendly and conversational while remaining helpful.",
      direct: "Be direct and concise, getting straight to the point.",
      encouraging: "Be encouraging and positive, focusing on what works well."
    };

    const focusMap = {
      code_review: "Focus on code quality, best practices, and potential bugs.",
      game_design: "Focus on game mechanics, user experience, and engagement.",
      performance: "Focus on performance optimization and efficiency.",
      accessibility: "Focus on accessibility and inclusive design."
    };

    const verbosityInstructions = settings.verbosity > 7 
      ? "Provide detailed, comprehensive explanations with examples."
      : settings.verbosity > 4
      ? "Provide balanced explanations with key points."
      : "Be concise and to the point.";

    return `${personaMap[settings.persona as keyof typeof personaMap]}
${toneMap[settings.tone as keyof typeof toneMap]}
${focusMap[settings.focus as keyof typeof focusMap]}
${verbosityInstructions}

You are helping review and improve the game: "${gameName}"

Current game code:
\`\`\`
${gameCode.substring(0, 2000)}${gameCode.length > 2000 ? '...(code truncated)' : ''}
\`\`\``;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser question: ${input}`;

      const { data, error } = await supabase.functions.invoke('lovable-ai', {
        body: { 
          prompt: fullPrompt,
          userName: 'Game Developer',
          points: 0
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.output 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="settings">
          <AccordionTrigger>AI Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label>Persona</Label>
                <Select 
                  value={settings.persona} 
                  onValueChange={(value) => setSettings({...settings, persona: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert Developer</SelectItem>
                    <SelectItem value="mentor">Patient Mentor</SelectItem>
                    <SelectItem value="critic">Critical Reviewer</SelectItem>
                    <SelectItem value="creative">Creative Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone</Label>
                <Select 
                  value={settings.tone} 
                  onValueChange={(value) => setSettings({...settings, tone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="encouraging">Encouraging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Focus Area</Label>
                <Select 
                  value={settings.focus} 
                  onValueChange={(value) => setSettings({...settings, focus: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code_review">Code Review</SelectItem>
                    <SelectItem value="game_design">Game Design</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Response Detail (Verbosity: {settings.verbosity})</Label>
                <Slider 
                  value={[settings.verbosity]} 
                  onValueChange={(value) => setSettings({...settings, verbosity: value[0]})}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Concise</span>
                  <span>Detailed</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="flex-1 overflow-auto p-4 mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p>Ask me anything about the game!</p>
            <p className="text-sm">Code review, improvements, bugs, or design ideas</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      <div className="flex gap-2">
        <Textarea
          placeholder="Ask about the game code, bugs, improvements..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="min-h-[60px]"
        />
        <Button 
          onClick={sendMessage} 
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
