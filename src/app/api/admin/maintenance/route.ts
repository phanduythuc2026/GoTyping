import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, updateSystemSetting } from "@/lib/admin-store";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  const settings = getSystemSettings();
  const isSuper = isAuthorizedSuperAdmin(req);

  return NextResponse.json({
    success: true,
    maintenance: settings.maintenance_config,
    isSuperAdminBypass: isSuper && settings.maintenance_config.isActive,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const {
      isActive,
      mode = "hard",
      reason,
      message,
      estimatedUptime,
      notifyBanner = true,
      safetyConfirmText,
    } = body;

    // Safety check: if activating hard lockdown, require 'LOCKDOWN' confirmation
    if (isActive && mode === "hard" && safetyConfirmText !== "LOCKDOWN") {
      return NextResponse.json(
        {
          success: false,
          error: "Yêu cầu gõ chính xác chữ 'LOCKDOWN' trong hộp thoại xác nhận an toàn trước khi kích hoạt Khóa toàn diện.",
        },
        { status: 400 }
      );
    }

    const updatedMaintenance = updateSystemSetting("maintenance_config", {
      isActive: Boolean(isActive),
      mode: mode === "soft" ? "soft" : "hard",
      reason: reason || "Nâng cấp bảo trì định kỳ",
      message: message || "Hệ thống đang bảo trì. Vui lòng quay lại sau!",
      estimatedUptime: estimatedUptime || null,
      notifyBanner: Boolean(notifyBanner),
    });

    const res = NextResponse.json({
      success: true,
      message: updatedMaintenance.isActive
        ? `Đã kích hoạt chế độ bảo trì (${updatedMaintenance.mode.toUpperCase()}) thành công!`
        : "Đã tắt chế độ bảo trì, máy chủ đã mở lại hoàn toàn cho mọi người dùng.",
      maintenance: updatedMaintenance,
    });

    res.cookies.set("gotyping_maintenance_active", updatedMaintenance.isActive ? "true" : "false", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return res;
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/maintenance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi cập nhật trạng thái bảo trì." },
      { status: 500 }
    );
  }
}
