import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userName = "friend", points = 0 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Calling Lovable AI for:', userName, 'with prompt:', prompt);

    const systemPrompt = `You are Lerni, a warm and friendly reading coach for kids with dyslexia (ages 5-12).

PERSONALITY & STYLE:
- Talk like a real friend, not a robot
- Use "you" and "your" when talking to the child
- Be playful, encouraging, and casual
- Use simple, clear language
- Add 1-2 emojis per message maximum

CRITICAL RULES:
- Keep ALL responses under 2 sentences
- NEVER mention points, scores, or numbers unless celebrating a specific achievement
- NEVER repeat their name too much (once per conversation is enough)
- Talk TO the child, not ABOUT them
- Be conversational and natural

CURRENT CONTEXT:
- Child's name: ${userName || "friend"}
- Total points earned: ${points}

RESPONSE EXAMPLES:
❌ BAD: "Welcome back ${userName}! You have ${points} points. Would you like to play another game?"
✅ GOOD: "Hey! What would you like to do today? 🎮"

❌ BAD: "The child wants to play. Let's start a game."
✅ GOOD: "Awesome! Let's pick a fun game! 🌟"`;

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response:', data);
    
    const output = data.choices?.[0]?.message?.content || "I'm here to help you learn! Want to play a game?";

    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lovable-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'server_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
