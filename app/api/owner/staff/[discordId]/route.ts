import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, appendWebStaffCommand } from "@/lib/auctionStore";

export async function DELETE(_: Request, { params }: { params: Promise<{ discordId: string }> }) {
  const { session } = await requireUser("owner");
  const { discordId } = await params;

  if (!/^\d{10,25}$/.test(discordId)) {
    return NextResponse.json({ error: "discordId invalid" }, { status: 400 });
  }

  // อย่าแก้/delete staff ใน web_bot_settings.json โดยตรง
  // ให้ส่งคำสั่งลบเข้าคิว แล้วบอทจะลบจาก STAFF_WAITING_CATEGORY_MAP/config.json เอง
  await appendWebStaffCommand({
    action: "remove_staff",
    staff_id: discordId,
    actor_id: session.id,
  });

  await appendAuditLog({ actor_id: session.id, action: "owner.staff.queue_remove", target_id: discordId });
  return NextResponse.json({ ok: true, queued: true });
}
