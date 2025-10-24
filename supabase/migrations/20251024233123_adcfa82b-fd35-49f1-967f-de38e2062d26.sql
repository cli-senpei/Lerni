-- Create game testing feedback table
CREATE TABLE IF NOT EXISTS public.game_testing_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  component_name TEXT NOT NULL,
  tester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tester_email TEXT,
  
  -- Checklist items
  loads_correctly BOOLEAN DEFAULT false,
  buttons_work BOOLEAN DEFAULT false,
  gameplay_works BOOLEAN DEFAULT false,
  no_visual_glitches BOOLEAN DEFAULT false,
  
  -- Feedback
  feedback_text TEXT,
  bugs_found TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Metadata
  test_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- Enable RLS
ALTER TABLE public.game_testing_feedback ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.game_testing_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert feedback
CREATE POLICY "Admins can insert feedback"
ON public.game_testing_feedback
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.game_testing_feedback
FOR SELECT
USING (auth.uid() = tester_id);

-- Create index for faster queries
CREATE INDEX idx_game_testing_feedback_game_id ON public.game_testing_feedback(game_id);
CREATE INDEX idx_game_testing_feedback_created_at ON public.game_testing_feedback(created_at DESC);