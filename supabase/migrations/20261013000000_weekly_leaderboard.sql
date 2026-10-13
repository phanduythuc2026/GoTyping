-- Migration: Weekly Cohort Leaderboard View and Typing Session Rollups
-- Requirement 3: Weekly Cohort Leaderboard (Bảng Xếp Hạng Nhóm Hàng Tuần)

CREATE OR REPLACE VIEW public.weekly_cohort_leaderboard AS
SELECT 
    p.id AS user_id,
    p.email,
    p.display_name,
    p.avatar_url,
    COALESCE(p.target_band, 7.5) AS target_band,
    COALESCE(SUM(ts.completed_words), 0)::INT AS weekly_words,
    COALESCE(ROUND(AVG(ts.net_wpm)), 0)::INT AS avg_net_wpm,
    COALESCE(ROUND(AVG(ts.accuracy), 1), 0.00)::NUMERIC(5, 1) AS avg_accuracy,
    COUNT(ts.id)::INT AS sessions_completed,
    (
        SELECT COUNT(*)::INT 
        FROM public.saved_vocabulary sv 
        WHERE sv.user_id = p.id 
          AND sv.created_at >= date_trunc('week', NOW())
    ) AS weekly_saved_vocab,
    MAX(ts.completed_at) AS last_active_at
FROM public.profiles p
LEFT JOIN public.typing_sessions ts 
    ON p.id = ts.user_id 
    AND ts.completed_at >= date_trunc('week', NOW())
GROUP BY p.id, p.email, p.display_name, p.avatar_url, p.target_band
HAVING COUNT(ts.id) > 0 OR p.total_sessions_completed > 0
ORDER BY weekly_words DESC, avg_net_wpm DESC;

-- Grant permissions for public/authenticated read
GRANT SELECT ON public.weekly_cohort_leaderboard TO authenticated;
GRANT SELECT ON public.weekly_cohort_leaderboard TO anon;
