import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, updateSystemSetting, SystemSettingsMap } from "@/lib/admin-store";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  // Allow super_admin or public read of non-sensitive keys
  const isSuper = isAuthorizedSuperAdmin(req);
  const settings = getSystemSettings();

  if (!isSuper) {
    return NextResponse.json({
      success: true,
      settings: {
        general_info: settings.general_info,
        feature_flags: settings.feature_flags,
        maintenance_config: settings.maintenance_config,
        theme_defaults: settings.theme_defaults,
      },
    });
  }

  return NextResponse.json({
    success: true,
    settings,
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
    const { key, value } = body;

    if (!key || typeof value !== "object") {
      return NextResponse.json(
        { success: false, error: "Tham số key hoặc value không hợp lệ." },
        { status: 400 }
      );
    }

    const updated = updateSystemSetting(key as keyof SystemSettingsMap, value);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật cài đặt ${key} thành công.`,
      updated,
    });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/settings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi lưu cài đặt hệ thống." },
      { status: 500 }
    );
  }
}
