-- 1. BẢNG THÔNG BÁO TOÀN HỆ THỐNG
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'toast', -- 'toast', 'changelog_modal', 'global_banner'
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
    is_active BOOLEAN NOT NULL DEFAULT true,
    target_audience VARCHAR(20) NOT NULL DEFAULT 'all', -- 'all', 'guests', 'authenticated'
    version_tag VARCHAR(20), -- e.g. 'v2.1.0' cho changelog
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ
);

-- 2. BẢNG THIẾT LẬP THỐNG SỐ HỆ THỐNG CHUNG
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Nạp cấu hình mặc định (kèm cấu hình bảo trì chi tiết)
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('general_info', '{"appName": "IELTS Scribe", "slogan": "Academic Typing & Lexical Reflex Engine", "supportEmail": "admin@gotyping.local", "canonicalUrl": "http://localhost:4000"}'::jsonb, 'Thông tin chung website'),
    ('feature_flags', '{"geminiAiEnabled": true, "articleScraperEnabled": true, "clozeModeEnabled": true, "radarCCEnabled": true, "leaderboardSyncEnabled": true, "donationsEnabled": false}'::jsonb, 'Công tắc tính năng toàn web'),
    ('maintenance_config', '{"isActive": false, "mode": "hard", "reason": "Nâng cấp engine từ vựng", "message": "Hệ thống đang bảo trì tối ưu hóa thuật toán bàn phím. Vui lòng quay lại sau ít phút!", "estimatedUptime": null, "notifyBanner": true}'::jsonb, 'Cấu hình bảo trì hệ thống và lockdown'),
    ('security_config', '{"rateLimitScraperPerMin": 15, "rateLimitAiPerMin": 20, "sessionTimeoutHours": 72, "captchaEnabled": false}'::jsonb, 'Cấu hình bảo mật và rate limiting'),
    ('theme_defaults', '{"defaultTheme": "dark", "accentColor": "indigo", "fontFamily": "JetBrains Mono"}'::jsonb, 'Cấu hình giao diện gốc')
ON CONFLICT (key) DO NOTHING;

-- RLS: Mọi người đọc được announcements đang active và settings công khai, chỉ Super Admin được ghi
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active announcements" ON public.announcements
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public read public settings" ON public.system_settings
    FOR SELECT TO public USING (key IN ('general_info', 'feature_flags', 'theme_defaults', 'maintenance_config'));
