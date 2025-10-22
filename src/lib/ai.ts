import { supabase } from "@/integrations/supabase/client";

export async function askHF(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('huggingface-ai', {
    body: { prompt }
  });

  if (error) {
    console.error('Hugging Face function error:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }

  if (!data || !data.output) {
    throw new Error('No output received from AI');
  }

  return data.output;
}
