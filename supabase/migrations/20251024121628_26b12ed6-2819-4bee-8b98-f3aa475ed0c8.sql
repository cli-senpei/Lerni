-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_learning_profiles
  INSERT INTO public.user_learning_profiles (
    user_id,
    user_name,
    has_completed_baseline,
    baseline_score,
    total_points,
    weaknesses
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Anonymous User'),
    false,
    0,
    0,
    '{}'::text[]
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert into user_progress
  INSERT INTO public.user_progress (
    user_id,
    level,
    total_points,
    total_lessons_completed,
    current_streak
  ) VALUES (
    NEW.id,
    1,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on user_id for both tables if not exists
ALTER TABLE public.user_learning_profiles 
  DROP CONSTRAINT IF EXISTS user_learning_profiles_user_id_key;

ALTER TABLE public.user_learning_profiles 
  ADD CONSTRAINT user_learning_profiles_user_id_key UNIQUE (user_id);

ALTER TABLE public.user_progress 
  DROP CONSTRAINT IF EXISTS user_progress_user_id_key;

ALTER TABLE public.user_progress 
  ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);