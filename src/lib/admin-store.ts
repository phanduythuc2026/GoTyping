export interface SystemSettingsMap {
  general_info: {
    appName: string;
    slogan: string;
    supportEmail: string;
    canonicalUrl: string;
    logoUrl?: string;
    studyGroups?: {
      zalo?: string;
      discord?: string;
      telegram?: string;
    };
  };
  feature_flags: {
    geminiAiEnabled: boolean;
    articleScraperEnabled: boolean;
    clozeModeEnabled: boolean;
    radarCCEnabled: boolean;
    leaderboardSyncEnabled: boolean;
    donationsEnabled: boolean;
    premiumQuotaLimit?: number;
  };
  maintenance_config: {
    isActive: boolean;
    mode: "hard" | "soft";
    reason: string;
    message: string;
    estimatedUptime: string | null;
    notifyBanner: boolean;
  };
  security_config: {
    rateLimitScraperPerMin: number;
    rateLimitAiPerMin: number;
    sessionTimeoutHours: number;
    captchaEnabled: boolean;
    ipBlacklist?: string[];
  };
  theme_defaults: {
    defaultTheme: "dark" | "light" | "system";
    accentColor: string;
    fontFamily: string;
  };
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: "toast" | "changelog_modal" | "global_banner";
  severity: "info" | "warning" | "critical";
  is_active: boolean;
  target_audience: "all" | "guests" | "authenticated";
  version_tag: string | null;
  created_at: string;
  expires_at: string | null;
}

// In-memory global store to ensure instant response & fallback
declare global {
  var __gotyping_settings: SystemSettingsMap | undefined;
  var __gotyping_announcements: AnnouncementItem[] | undefined;
}

export const defaultSystemSettings: SystemSettingsMap = {
  general_info: {
    appName: "IELTS Scribe",
    slogan: "Academic Typing & Lexical Reflex Engine",
    supportEmail: "admin@gotyping.local",
    canonicalUrl: "http://localhost:4000",
    logoUrl: "",
    studyGroups: {
      zalo: "https://zalo.me/g/ielts-scribe-pro",
      discord: "https://discord.gg/ielts-scribe",
      telegram: "https://t.me/ielts_scribe_news",
    },
  },
  feature_flags: {
    geminiAiEnabled: true,
    articleScraperEnabled: true,
    clozeModeEnabled: true,
    radarCCEnabled: true,
    leaderboardSyncEnabled: true,
    donationsEnabled: false,
    premiumQuotaLimit: 10,
  },
  maintenance_config: {
    isActive: false,
    mode: "hard",
    reason: "Nâng cấp thuật toán bàn phím & Từ điển C1 AWL",
    message:
      "Hệ thống đang tiến hành nâng cấp engine từ vựng và tối ưu hóa hạ tầng máy chủ. Quý học viên vui lòng quay lại sau ít phút!",
    estimatedUptime: null,
    notifyBanner: true,
  },
  security_config: {
    rateLimitScraperPerMin: 15,
    rateLimitAiPerMin: 20,
    sessionTimeoutHours: 72,
    captchaEnabled: false,
    ipBlacklist: [],
  },
  theme_defaults: {
    defaultTheme: "dark",
    accentColor: "indigo",
    fontFamily: "JetBrains Mono",
  },
};

export const defaultAnnouncements: AnnouncementItem[] = [
  {
    id: "ann-001",
    title: "Mẹo IELTS Task 2 Trong Ngày",
    content: "Sử dụng các trạng từ liên kết như 'Consequently' hoặc 'Notwithstanding' để nâng band điểm Coherence & Cohesion lên 7.5+.",
    type: "toast",
    severity: "info",
    is_active: true,
    target_audience: "all",
    version_tag: null,
    created_at: new Date().toISOString(),
    expires_at: null,
  },
  {
    id: "ann-002",
    title: "Bản Cập Nhật IELTS Scribe v2.1.0",
    content:
      "1. Sửa triệt để tọa độ con trỏ Caret bám khít từng ký tự.\n2. Bảng màu kép WCAG AAA tối ưu cho chế độ Sáng / Tối.\n3. Hộp thoại tự chọn Target Band từ 5.0 đến 9.0.\n4. Bảng điều khiển Super Admin quản lý toàn diện.",
    type: "changelog_modal",
    severity: "info",
    is_active: true,
    target_audience: "all",
    version_tag: "v2.1.0",
    created_at: new Date().toISOString(),
    expires_at: null,
  },
  {
    id: "ann-003",
    title: "Đua Top Tuần Nhận Tài Khoản Pro",
    content: "Hoàn thành tối thiểu 5 bài gõ với độ chính xác trên 96% để ghi danh vào Bảng Xếp Hạng tuần này!",
    type: "global_banner",
    severity: "info",
    is_active: false,
    target_audience: "all",
    version_tag: null,
    created_at: new Date().toISOString(),
    expires_at: null,
  },
];

export function getSystemSettings(): SystemSettingsMap {
  if (!globalThis.__gotyping_settings) {
    globalThis.__gotyping_settings = JSON.parse(JSON.stringify(defaultSystemSettings));
  }
  return globalThis.__gotyping_settings!;
}

export function updateSystemSetting<K extends keyof SystemSettingsMap>(
  key: K,
  value: Partial<SystemSettingsMap[K]>
): SystemSettingsMap[K] {
  const current = getSystemSettings();
  current[key] = {
    ...current[key],
    ...value,
  };
  return current[key];
}

export function getAnnouncements(): AnnouncementItem[] {
  if (!globalThis.__gotyping_announcements) {
    globalThis.__gotyping_announcements = JSON.parse(JSON.stringify(defaultAnnouncements));
  }
  return globalThis.__gotyping_announcements!;
}

export function addAnnouncement(item: Omit<AnnouncementItem, "id" | "created_at">): AnnouncementItem {
  const announcements = getAnnouncements();
  const newItem: AnnouncementItem = {
    ...item,
    id: `ann-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  announcements.unshift(newItem);
  return newItem;
}

export function updateAnnouncement(id: string, updates: Partial<AnnouncementItem>): AnnouncementItem | null {
  const announcements = getAnnouncements();
  const index = announcements.findIndex((a) => a.id === id);
  if (index === -1) return null;
  announcements[index] = { ...announcements[index], ...updates };
  return announcements[index];
}

export function deleteAnnouncement(id: string): boolean {
  const announcements = getAnnouncements();
  const index = announcements.findIndex((a) => a.id === id);
  if (index === -1) return false;
  announcements.splice(index, 1);
  return true;
}
