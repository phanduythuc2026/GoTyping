-- Supabase PostgreSQL Migration for IELTS Scribe (GoTyping)
-- Enables UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Rollup counter statistics)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'IELTS Scholar',
    avatar_url TEXT,
    target_band NUMERIC(2, 1) DEFAULT 7.0 CHECK (target_band >= 0.0 AND target_band <= 9.0),
    preferred_theme TEXT DEFAULT 'dark',
    sound_enabled BOOLEAN DEFAULT false,
    total_sessions_completed INT DEFAULT 0,
    total_words_typed INT DEFAULT 0,
    best_wpm INT DEFAULT 0,
    avg_accuracy NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to sync new Auth users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'IELTS Scholar'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    source_url TEXT,
    source_domain TEXT,
    content_raw TEXT NOT NULL,
    content_clean TEXT NOT NULL,
    word_count INT NOT NULL,
    lexical_level TEXT DEFAULT 'Academic',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TYPING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.typing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    wpm INT NOT NULL,
    net_wpm INT NOT NULL,
    accuracy NUMERIC(5, 2) NOT NULL,
    time_spent_seconds INT NOT NULL,
    error_count INT DEFAULT 0,
    completed_words INT NOT NULL,
    key_errors_summary JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.typing_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_article ON public.typing_sessions(article_id);

-- Rollup Trigger: Automatically updates statistics in profiles after each session
CREATE OR REPLACE FUNCTION public.update_profile_rollup_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_words_typed = total_words_typed + NEW.completed_words,
    best_wpm = GREATEST(best_wpm, NEW.net_wpm),
    avg_accuracy = ROUND(
      (avg_accuracy * total_sessions_completed + NEW.accuracy) / (total_sessions_completed + 1),
      2
    ),
    total_sessions_completed = total_sessions_completed + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_rollup_metrics ON public.typing_sessions;
CREATE TRIGGER trigger_rollup_metrics
  AFTER INSERT ON public.typing_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.update_profile_rollup_metrics();

-- 4. SAVED VOCABULARY TABLE (Anki & Flashcard export)
CREATE TABLE IF NOT EXISTS public.saved_vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    word TEXT NOT NULL,
    phonetic TEXT,
    meaning_vi TEXT,
    context_sentence TEXT,
    cefr_level TEXT DEFAULT 'C1',
    is_exported_to_anki BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_vocab_user ON public.saved_vocabulary(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_vocabulary ENABLE ROW LEVEL SECURITY;

-- Profiles: Read and update own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Articles: Public articles readable by all, authenticated users can insert and update own
CREATE POLICY "Public articles readable by everyone"
  ON public.articles FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = created_by);

-- Sessions: Users have full access to their own sessions
CREATE POLICY "Users manage own sessions"
  ON public.typing_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Saved Vocabulary: Users manage their own vocabulary bank
CREATE POLICY "Users manage own vocabulary"
  ON public.saved_vocabulary FOR ALL
  USING (auth.uid() = user_id);
