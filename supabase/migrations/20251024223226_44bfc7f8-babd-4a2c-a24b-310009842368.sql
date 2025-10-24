-- Add code column to games table to store game component code
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS code TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.games.code IS 'TypeScript/React code for the game component';