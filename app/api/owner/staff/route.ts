import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, appendWebStaffCommand, getWebSettings } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("owner");
  const settings = await getWebSettings();
  return NextResponse.json({ staff: Object.values(settings.staff), settings });
}

export async function POST(req: NextRequest) {
  const { session } = await requireUser("owner");
  const body = await req.json();
  const discordId = String(body.discord_id || "").trim();
  if (!/^\d{10,25}$/.test(discordId)) return NextResponse.json({ error: "discord_id invalid" }, { status: 400 });

  const waitingCategoryId = String(body.waiting_category_id || "").trim();
  if (waitingCategoryId && !/^\d{10,25}$/.test(waitingCategoryId)) {
    return NextResponse.json({ error: "waiting_category_id invalid" }, { status: 400 });
  }

  // Staff sync แบบใหม่:
  // เว็บไม่แก้ web_bot_settings.json โดยตรง เพราะไฟล์นั้นเป็น mirror สำหรับแสดงผลเท่านั้น
  // ให้ส่งคำสั่งเข้า web_staff_commands.json แล้ว main.py จะ merge เข้า STAFF_WAITING_CATEGORY_MAP ของบอท
  await appendWebStaffCommand({
    action: "upsert_staff",
    staff_id: discordId,
    waiting_category_id: waitingCategoryId || undefined,
    note: String(body.note || ""),
    actor_id: session.id,
  });

  await appendAuditLog({ actor_id: session.id, action: "owner.staff.queue_add", target_id: discordId, detail: `waiting_category=${waitingCategoryId || ""}` });
  return NextResponse.json({ ok: true, queued: true });
}
