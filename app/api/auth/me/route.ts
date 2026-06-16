import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getWebSettings } from "@/lib/auctionStore";
import { getRoleForDiscordId } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  const settings = await getWebSettings();
  return NextResponse.json({ user: session, role: getRoleForDiscordId(session?.id, settings) });
}
