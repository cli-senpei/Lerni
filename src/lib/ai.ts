import { supabase } from "@/integrations/supabase/client";

export async function askAI(prompt: string, userName?: string, points?: number): Promise<string> {
  const { data, error } = await supabase.functions.invoke('lovable-ai', {
    body: { prompt, userName, points }
  });

  if (error) {
    console.error('AI function error:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }

  if (!data || !data.output) {
    throw new Error('No output received from AI');
  }

  return data.output;
}
