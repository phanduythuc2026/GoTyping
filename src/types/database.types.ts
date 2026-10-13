export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          target_band: number;
          preferred_theme: string;
          sound_enabled: boolean;
          total_sessions_completed: number;
          total_words_typed: number;
          best_wpm: number;
          avg_accuracy: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string;
          avatar_url?: string | null;
          target_band?: number;
          preferred_theme?: string;
          sound_enabled?: boolean;
          total_sessions_completed?: number;
          total_words_typed?: number;
          best_wpm?: number;
          avg_accuracy?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          target_band?: number;
          preferred_theme?: string;
          sound_enabled?: boolean;
          total_sessions_completed?: number;
          total_words_typed?: number;
          best_wpm?: number;
          avg_accuracy?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          created_by: string | null;
          title: string;
          source_url: string | null;
          source_domain: string | null;
          content_raw: string;
          content_clean: string;
          word_count: number;
          lexical_level: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          title: string;
          source_url?: string | null;
          source_domain?: string | null;
          content_raw: string;
          content_clean: string;
          word_count: number;
          lexical_level?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          title?: string;
          source_url?: string | null;
          source_domain?: string | null;
          content_raw?: string;
          content_clean?: string;
          word_count?: number;
          lexical_level?: string;
          is_public?: boolean;
          created_at?: string;
        };
      };
      typing_sessions: {
        Row: {
          id: string;
          user_id: string;
          article_id: string | null;
          wpm: number;
          net_wpm: number;
          accuracy: number;
          time_spent_seconds: number;
          error_count: number;
          completed_words: number;
          key_errors_summary: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id?: string | null;
          wpm: number;
          net_wpm: number;
          accuracy: number;
          time_spent_seconds: number;
          error_count?: number;
          completed_words: number;
          key_errors_summary?: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string | null;
          wpm?: number;
          net_wpm?: number;
          accuracy?: number;
          time_spent_seconds?: number;
          error_count?: number;
          completed_words?: number;
          key_errors_summary?: Json;
          completed_at?: string;
        };
      };
      saved_vocabulary: {
        Row: {
          id: string;
          user_id: string;
          article_id: string | null;
          word: string;
          phonetic: string | null;
          meaning_vi: string | null;
          context_sentence: string | null;
          cefr_level: string;
          is_exported_to_anki: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id?: string | null;
          word: string;
          phonetic?: string | null;
          meaning_vi?: string | null;
          context_sentence?: string | null;
          cefr_level?: string;
          is_exported_to_anki?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string | null;
          word?: string;
          phonetic?: string | null;
          meaning_vi?: string | null;
          context_sentence?: string | null;
          cefr_level?: string;
          is_exported_to_anki?: boolean;
          created_at?: string;
        };
      };
      weekly_cohort_leaderboard: {
        Row: {
          user_id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          target_band: number;
          weekly_words: number;
          avg_net_wpm: number;
          avg_accuracy: number;
          sessions_completed: number;
          weekly_saved_vocab: number;
          last_active_at: string | null;
        };
        Insert: {
          user_id: string;
          email: string;
          display_name?: string;
          avatar_url?: string | null;
          target_band?: number;
          weekly_words?: number;
          avg_net_wpm?: number;
          avg_accuracy?: number;
          sessions_completed?: number;
          weekly_saved_vocab?: number;
          last_active_at?: string | null;
        };
        Update: {
          user_id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          target_band?: number;
          weekly_words?: number;
          avg_net_wpm?: number;
          avg_accuracy?: number;
          sessions_completed?: number;
          weekly_saved_vocab?: number;
          last_active_at?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: string;
          severity: string;
          is_active: boolean;
          target_audience: string;
          version_tag: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: string;
          severity?: string;
          is_active?: boolean;
          target_audience?: string;
          version_tag?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: string;
          severity?: string;
          is_active?: boolean;
          target_audience?: string;
          version_tag?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      system_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      weekly_cohort_leaderboard: {
        Row: {
          user_id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          target_band: number;
          weekly_words: number;
          avg_net_wpm: number;
          avg_accuracy: number;
          sessions_completed: number;
          weekly_saved_vocab: number;
          last_active_at: string | null;
        };
      };
    };
  };
}
