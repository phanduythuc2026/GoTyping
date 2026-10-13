import crypto from "crypto";

export interface ManagedUser {
  id: string;
  email: string;
  display_name: string;
  role: "super_admin" | "admin" | "user";
  target_band: number;
  total_sessions_completed: number;
  is_active: boolean;
  created_at: string;
  passwordHash?: string;
}

declare global {
  var __gotyping_users: ManagedUser[] | undefined;
}

const DEFAULT_HASH = crypto.createHash("sha256").update("GoTyping2026!").digest("hex");

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "usr-001",
    email: "scholar_ielts@academic.edu.vn",
    display_name: "Nguyễn Hoàng Nam",
    role: "user",
    target_band: 7.5,
    total_sessions_completed: 42,
    is_active: true,
    created_at: "2026-10-01 09:30",
    passwordHash: DEFAULT_HASH,
  },
  {
    id: "usr-002",
    email: "minh_ielts_8@gmail.com",
    display_name: "Trần Minh",
    role: "user",
    target_band: 8.0,
    total_sessions_completed: 67,
    is_active: true,
    created_at: "2026-10-05 14:15",
    passwordHash: DEFAULT_HASH,
  },
  {
    id: "usr-003",
    email: "le_ha_scholar@outlook.com",
    display_name: "Lê Thu Hà",
    role: "user",
    target_band: 7.0,
    total_sessions_completed: 18,
    is_active: true,
    created_at: "2026-10-08 11:20",
    passwordHash: DEFAULT_HASH,
  },
];

export function getUsers(): ManagedUser[] {
  if (!globalThis.__gotyping_users || globalThis.__gotyping_users.length === 0) {
    globalThis.__gotyping_users = JSON.parse(JSON.stringify(INITIAL_USERS));
  }
  return globalThis.__gotyping_users!;
}

export function findUserByEmail(email: string): ManagedUser | undefined {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): ManagedUser | undefined {
  const users = getUsers();
  return users.find((u) => u.id === id);
}

export function createUser(params: {
  email: string;
  fullName: string;
  role?: "user" | "admin" | "super_admin";
  targetBand?: number;
  password?: string;
}): { success: boolean; user?: ManagedUser; error?: string } {
  const users = getUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: "Email này đã được sử dụng trên hệ thống." };
  }

  const rawPassword = params.password || "GoTyping2026!";
  const passwordHash = crypto.createHash("sha256").update(rawPassword).digest("hex");

  const newUser: ManagedUser = {
    id: "usr-" + crypto.randomBytes(4).toString("hex"),
    email: normalizedEmail,
    display_name: params.fullName.trim() || normalizedEmail.split("@")[0],
    role: params.role || "user",
    target_band: params.targetBand || 7.5,
    total_sessions_completed: 0,
    is_active: true,
    created_at: new Date().toISOString().replace("T", " ").slice(0, 16),
    passwordHash,
  };

  users.push(newUser);
  return { success: true, user: newUser };
}

export function updateUserPassword(
  userId: string,
  newPassword: string
): { success: boolean; newPassword?: string; error?: string } {
  const user = findUserById(userId);
  if (!user) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  // Immediately overwrite and permanently invalidate old password
  const newHash = crypto.createHash("sha256").update(newPassword).digest("hex");
  user.passwordHash = newHash;

  return { success: true, newPassword };
}
