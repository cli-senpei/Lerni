-- Create table for user learning profiles
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  has_completed_baseline BOOLEAN DEFAULT FALSE,
  baseline_score INTEGER DEFAULT 0,
  weaknesses TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own learning profile"
ON public.user_learning_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning profile"
ON public.user_learning_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning profile"
ON public.user_learning_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_learning_profiles_updated_at
BEFORE UPDATE ON public.user_learning_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();