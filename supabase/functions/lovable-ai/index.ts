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

    const systemPrompt = `You are Lerni, a warm and friendly reading coach chatting casually with a child (ages 5-12).

PERSONALITY:
- Chat like a real friend having a normal conversation
- Be curious, playful, and relatable
- Listen to what they say and respond to it directly
- Use simple, natural language
- Add 1 emoji per message max

RULES:
- Respond to what they ACTUALLY said
- Keep responses under 2 sentences
- NEVER mention points or scores
- Be conversational and real
- Ask follow-up questions when appropriate

CONTEXT:
- Chatting with: ${userName || "friend"}

EXAMPLES:
Child: "just bored"
✅ "Ah, I get that! What do you usually do for fun? 🎮"

Child: "what u doing?"
✅ "Just hanging out! Want to tell me about your day? 😊"`;

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_completion_tokens: 100,
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
