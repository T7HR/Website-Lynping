import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, getWebSettings, saveWebSettings } from "@/lib/auctionStore";

export async function DELETE(_: Request, { params }: { params: Promise<{ discordId: string }> }) {
  const { session } = await requireUser("owner");
  const { discordId } = await params;
  const settings = await getWebSettings();
  delete settings.staff[discordId];
  settings.updated_by = session.id;
  await saveWebSettings(settings);
  await appendAuditLog({ actor_id: session.id, action: "owner.staff.remove", target_id: discordId });
  return NextResponse.json({ ok: true });
}
