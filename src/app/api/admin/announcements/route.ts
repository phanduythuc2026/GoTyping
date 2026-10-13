import { NextRequest, NextResponse } from "next/server";
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AnnouncementItem,
} from "@/lib/admin-store";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

// GET: list announcements
export async function GET(req: NextRequest) {
  const isSuper = isAuthorizedSuperAdmin(req);
  const announcements = getAnnouncements();

  if (!isSuper) {
    // Return only active announcements for public
    const active = announcements.filter((a) => a.is_active);
    return NextResponse.json({ success: true, announcements: active });
  }

  return NextResponse.json({
    success: true,
    announcements,
  });
}

// POST: create or update announcement
export async function POST(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const { action, item, id, updates } = body;

    if (action === "create") {
      if (!item?.title || !item?.content || !item?.type) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập đầy đủ tiêu đề, nội dung và phân loại." },
          { status: 400 }
        );
      }

      const created = addAnnouncement({
        title: item.title,
        content: item.content,
        type: item.type,
        severity: item.severity || "info",
        is_active: item.is_active ?? true,
        target_audience: item.target_audience || "all",
        version_tag: item.version_tag || null,
        expires_at: item.expires_at || null,
      });

      return NextResponse.json({
        success: true,
        message: "Tạo thông báo thành công.",
        announcement: created,
      });
    }

    if (action === "update") {
      if (!id || !updates) {
        return NextResponse.json(
          { success: false, error: "Thiếu ID hoặc dữ liệu cập nhật." },
          { status: 400 }
        );
      }

      const updated = updateAnnouncement(id, updates as Partial<AnnouncementItem>);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy thông báo." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Cập nhật thông báo thành công.",
        announcement: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Hành động không hợp lệ." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/announcements (POST)",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi lưu thông báo." },
      { status: 500 }
    );
  }
}

// DELETE: remove announcement
export async function DELETE(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID thông báo cần xóa." },
        { status: 400 }
      );
    }

    const removed = deleteAnnouncement(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông báo cần xóa." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa thông báo thành công.",
    });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/announcements (DELETE)",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi xóa thông báo." },
      { status: 500 }
    );
  }
}
