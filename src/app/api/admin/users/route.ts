import { NextRequest, NextResponse } from "next/server";
import { generateOwaspCompliantPassword } from "@/lib/security";
import { z } from "zod";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";
import {
  getUsers,
  findUserById,
  createUser,
  updateUserPassword,
} from "@/lib/auth/user-registry";

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
    users: getUsers(),
  });
}

// POST: Admin Actions (create_user, reset_password, update_email, toggle_ban, change_band, change_role)
const actionSchema = z.object({
  action: z.enum([
    "create_user",
    "reset_password",
    "update_email",
    "toggle_ban",
    "change_band",
    "change_role",
  ]),
  userId: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  newEmail: z.string().email().optional(),
  customPassword: z.string().optional(),
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

    const {
      action,
      userId,
      fullName,
      email,
      newEmail,
      customPassword,
      targetBand,
      role,
    } = parsed.data;

    // 1. Create User Action (Super Admin creates brand new account)
    if (action === "create_user") {
      if (!email || !fullName) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập họ tên và email hợp lệ." },
          { status: 400 }
        );
      }

      const rawPassword = customPassword?.trim() || generateOwaspCompliantPassword(14);
      const result = createUser({
        email,
        fullName,
        role: role || "user",
        targetBand: targetBand || 7.5,
        password: rawPassword,
      });

      if (!result.success || !result.user) {
        return NextResponse.json(
          { success: false, error: result.error || "Không thể tạo tài khoản mới." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Đã tạo tài khoản thành công cho ${result.user.display_name} (${result.user.email}).`,
        user: result.user,
        initialPassword: rawPassword,
      });
    }

    // For other actions, userId is required
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Thiếu userId cho tác vụ này." },
        { status: 400 }
      );
    }

    const targetUser = findUserById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng được chỉ định." },
        { status: 404 }
      );
    }

    // 2. Reset / Change Password Action (Supports Custom Password & OWASP random, wipes old password immediately)
    if (action === "reset_password") {
      const finalPassword =
        customPassword && customPassword.trim().length >= 6
          ? customPassword.trim()
          : generateOwaspCompliantPassword(14);

      const updateResult = updateUserPassword(targetUser.id, finalPassword);
      if (!updateResult.success) {
        return NextResponse.json(
          { success: false, error: updateResult.error || "Không thể đổi mật khẩu." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Đã đổi mật khẩu thành công cho ${targetUser.email}. Mật khẩu cũ đã bị hủy ngay lập tức và không còn hiệu lực.`,
        temporaryPassword: finalPassword,
        isCustom: Boolean(customPassword && customPassword.trim().length >= 6),
      });
    }

    // 3. Update Email Action
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
        message: `Đã cập nhật email của người dùng thành ${newEmail}.`,
        updatedEmail: newEmail,
      });
    }

    // 4. Toggle Ban / Active Status
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

    // 5. Change Target Band
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

    // 6. Change Role
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
