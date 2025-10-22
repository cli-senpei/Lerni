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
    const { prompt } = await req.json();
    const HUGGINGFACE_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN');
    
    if (!HUGGINGFACE_TOKEN) {
      throw new Error('HUGGINGFACE_TOKEN is not configured');
    }

    console.log('Calling Hugging Face with prompt:', prompt);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] You are Lerni, a friendly reading coach for kids with dyslexia. Be warm and encouraging. Keep ALL responses SHORT (1-2 sentences ONLY). Never repeat instructions back. ${prompt} [/INST]`,
          parameters: {
            temperature: 0.7,
            max_new_tokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face response:', data);
    
    // Extract the generated text from the response
    let output = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    
    // Clean up the response - remove the instruction prompt echo
    if (output) {
      // Remove everything before [/INST] if it exists
      const instEnd = output.lastIndexOf('[/INST]');
      if (instEnd !== -1) {
        output = output.substring(instEnd + 7).trim();
      }
      // Remove any remaining instruction artifacts
      output = output.replace(/^\[INST\].*?\[\/INST\]/gs, '').trim();
      output = output.replace(/<s>|<\/s>/g, '').trim();
    }

    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in huggingface-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'server_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
