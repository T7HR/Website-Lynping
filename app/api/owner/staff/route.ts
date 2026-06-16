import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, getWebSettings, saveWebSettings } from "@/lib/auctionStore";

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

  const settings = await getWebSettings();
  settings.staff[discordId] = {
    id: discordId,
    note: String(body.note || ""),
    waiting_category_id: String(body.waiting_category_id || ""),
    enabled: body.enabled !== false,
    added_by: session.id,
    added_at: new Date().toISOString(),
  };
  settings.updated_by = session.id;
  await saveWebSettings(settings);
  await appendAuditLog({ actor_id: session.id, action: "owner.staff.add", target_id: discordId, detail: `waiting_category=${body.waiting_category_id || ""}` });
  return NextResponse.json({ ok: true, staff: settings.staff[discordId] });
}
