-- Supabase Migration: Target Band Setting & Extended Lexical Schema
-- 1. Ensure target_band constraint in profiles table (5.0 to 9.0, default 7.5)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_target_band_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_target_band_check
  CHECK (target_band >= 5.0 AND target_band <= 9.0);

ALTER TABLE public.profiles
  ALTER COLUMN target_band SET DEFAULT 7.5;

-- 2. Extend saved_vocabulary table with multi-dimensional linguistic fields
ALTER TABLE public.saved_vocabulary
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'word',
  ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'Academic Writing',
  ADD COLUMN IF NOT EXISTS definition_vi TEXT,
  ADD COLUMN IF NOT EXISTS definition_en TEXT,
  ADD COLUMN IF NOT EXISTS part_of_speech TEXT DEFAULT 'Noun',
  ADD COLUMN IF NOT EXISTS mastery_level INT DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 5);

CREATE INDEX IF NOT EXISTS idx_saved_vocab_topic ON public.saved_vocabulary(topic);
CREATE INDEX IF NOT EXISTS idx_saved_vocab_type ON public.saved_vocabulary(item_type);
