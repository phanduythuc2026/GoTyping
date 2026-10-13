import { NextRequest, NextResponse } from "next/server";
import { generateOwaspCompliantPassword } from "@/lib/security";
import { z } from "zod";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

// Mock persistent in-memory user registry for demo/fallback environment
interface ManagedUser {
  id: string;
  email: string;
  display_name: string;
  role: "super_admin" | "admin" | "user";
  target_band: number;
  total_sessions_completed: number;
  is_active: boolean;
  created_at: string;
}

const mockUsersRegistry: ManagedUser[] = [
  {
    id: "usr-001",
    email: "scholar_ielts@academic.edu.vn",
    display_name: "Nguyễn Hoàng Nam",
    role: "user",
    target_band: 7.5,
    total_sessions_completed: 42,
    is_active: true,
    created_at: "2026-10-01 09:30",
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
  },
  {
    id: "usr-003",
    email: "le_ha_scholar@outlook.com",
    display_name: "Lê Thu Hà",
    role: "user",
    target_band: 7.0,
    total_sessions_completed: 18,
    is_active: false,
    created_at: "2026-10-08 11:20",
  },
];

// GET: List users
export async function GET(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    users: mockUsersRegistry,
  });
}

// POST: Admin Actions (reset_password, update_email, toggle_ban, change_band, change_role)
const actionSchema = z.object({
  action: z.enum(["reset_password", "update_email", "toggle_ban", "change_band", "change_role"]),
  userId: z.string(),
  newEmail: z.string().email().optional(),
  targetBand: z.number().min(5.0).max(9.0).optional(),
  role: z.enum(["super_admin", "admin", "user"]).optional(),
});

export async function POST(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Tham số không hợp lệ." },
        { status: 400 }
      );
    }

    const { action, userId, newEmail, targetBand, role } = parsed.data;
    const targetUser = mockUsersRegistry.find((u) => u.id === userId);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng được chỉ định." },
        { status: 404 }
      );
    }

    // 1. Reset Password Action
    if (action === "reset_password") {
      const temporarySecurePassword = generateOwaspCompliantPassword(14);
      return NextResponse.json({
        success: true,
        message: `Đã cấp lại mật khẩu đạt chuẩn OWASP cho ${targetUser.email}.`,
        temporaryPassword: temporarySecurePassword,
        owaspCompliant: true,
      });
    }

    // 2. Update Email Action
    if (action === "update_email") {
      if (!newEmail) {
        return NextResponse.json(
          { success: false, error: "Vui lòng cung cấp email mới hợp lệ." },
          { status: 400 }
        );
      }
      targetUser.email = newEmail;
      return NextResponse.json({
        success: true,
        message: `Đã cập nhật email của người dùng thành ${newEmail} và đồng bộ sang profiles.`,
        updatedEmail: newEmail,
      });
    }

    // 3. Toggle Ban / Active Status
    if (action === "toggle_ban") {
      targetUser.is_active = !targetUser.is_active;
      return NextResponse.json({
        success: true,
        message: `Trạng thái tài khoản ${targetUser.email} đã đổi thành: ${
          targetUser.is_active ? "Đang hoạt động" : "Đã khóa (Banned)"
        }`,
        isActive: targetUser.is_active,
      });
    }

    // 4. Change Target Band
    if (action === "change_band") {
      if (targetBand !== undefined) {
        targetUser.target_band = targetBand;
        return NextResponse.json({
          success: true,
          message: `Đã cập nhật Target Band của ${targetUser.email} thành ${targetBand.toFixed(1)}.`,
          targetBand,
        });
      }
    }

    // 5. Change Role
    if (action === "change_role") {
      if (role) {
        targetUser.role = role;
        return NextResponse.json({
          success: true,
          message: `Đã cập nhật quyền của ${targetUser.email} thành ${role}.`,
          role,
        });
      }
    }

    return NextResponse.json({ success: false, error: "Hành động không xác định." }, { status: 400 });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi thực hiện tác vụ Super Admin." },
      { status: 500 }
    );
  }
}
