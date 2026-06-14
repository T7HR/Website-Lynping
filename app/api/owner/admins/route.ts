import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, getWebSettings, saveWebSettings } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("owner");
  const settings = await getWebSettings();
  return NextResponse.json({ admins: Object.values(settings.admins), settings });
}

export async function POST(req: NextRequest) {
  const { session } = await requireUser("owner");
  const body = await req.json();
  const discordId = String(body.discord_id || "").trim();
  if (!/^\d{10,25}$/.test(discordId)) return NextResponse.json({ error: "discord_id invalid" }, { status: 400 });

  const settings = await getWebSettings();
  settings.admins[discordId] = {
    id: discordId,
    note: String(body.note || ""),
    enabled: body.enabled !== false,
    added_by: session.id,
    added_at: new Date().toISOString(),
  };
  settings.staff_manager_ids = Array.from(new Set([settings.owner_id, ...settings.staff_manager_ids, discordId]));
  settings.updated_by = session.id;
  await saveWebSettings(settings);
  await appendAuditLog({ actor_id: session.id, action: "owner.admin.add", target_id: discordId, detail: body.note });
  return NextResponse.json({ ok: true, admin: settings.admins[discordId] });
}
