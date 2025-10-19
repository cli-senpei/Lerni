-- Create leaderboard_entries table
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  comment TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leaderboard_entries
-- Everyone can view the leaderboard
CREATE POLICY "Anyone can view leaderboard entries" 
ON public.leaderboard_entries 
FOR SELECT 
USING (true);

-- Users can insert their own entry
CREATE POLICY "Users can insert their own leaderboard entry" 
ON public.leaderboard_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own entry
CREATE POLICY "Users can update their own leaderboard entry" 
ON public.leaderboard_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own entry
CREATE POLICY "Users can delete their own leaderboard entry" 
ON public.leaderboard_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leaderboard_entries_updated_at
BEFORE UPDATE ON public.leaderboard_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster leaderboard queries
CREATE INDEX idx_leaderboard_score ON public.leaderboard_entries(score DESC);
CREATE INDEX idx_leaderboard_user_id ON public.leaderboard_entries(user_id);