import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/auth/user-registry";
import { createAdminClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự").max(100),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(128),
  targetBand: z.number().min(5.0).max(9.0).optional().default(7.5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Thông tin không hợp lệ" },
        { status: 400 }
      );
    }

    const { fullName, email, password, targetBand } = parsed.data;

    // Check duplicate
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 400 }
      );
    }

    // Attempt optional Supabase user creation (safely in try/catch to prevent 'Failed to fetch' crash)
    try {
      const supabase = createAdminClient();
      type SupabaseAdminAuth = {
        auth?: {
          admin?: {
            createUser?: (params: unknown) => Promise<unknown>;
          };
        };
      };
      const adminClient = supabase as unknown as SupabaseAdminAuth;
      if (adminClient.auth?.admin?.createUser) {
        await adminClient.auth.admin.createUser({
          email,
          password,
          user_metadata: { full_name: fullName, target_band: targetBand },
          email_confirm: true,
        });
      }
    } catch (e) {
      // Offline fallback: graceful degradation
      console.warn("Supabase auth offline fallback:", e);
    }

    // Create user in persistent registry
    const result = createUser({
      email,
      fullName,
      password,
      role: "user",
      targetBand,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "Không thể tạo tài khoản." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.",
      user: {
        id: result.user.id,
        email: result.user.email,
        display_name: result.user.display_name,
        role: result.user.role,
        target_band: result.user.target_band,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi máy chủ khi đăng ký. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
