import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStaffShop, getWebSettings } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { getEnabledStaffIds, toStaffMoneyRows } from "@/lib/reportDisplay";
import { getRoleForDiscordId, hasRole } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: noStoreHeaders() });
  }

  const [settings, shop] = await Promise.all([getWebSettings(), getStaffShop()]);
  const role = await getRoleForDiscordId(session.id, settings);
  if (!hasRole(role, "staff")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: noStoreHeaders() });
  }

  const staffIds = getEnabledStaffIds(settings);
  const rows = await withDiscordProfiles(toStaffMoneyRows(shop, staffIds), staffIds.length);

  return NextResponse.json({
    rows,
    staff_count: staffIds.length,
    refreshed_at: new Date().toISOString(),
  }, { headers: noStoreHeaders() });
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}
