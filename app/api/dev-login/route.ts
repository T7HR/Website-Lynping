import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { ENABLE_DEV_LOGIN, OWNER_DISCORD_ID, SITE_URL } from "@/lib/env";

export async function GET(req: NextRequest) {
  if (!ENABLE_DEV_LOGIN) return NextResponse.json({ error: "dev login disabled" }, { status: 403 });
  const role = req.nextUrl.searchParams.get("role") || "owner";
  const id = role === "owner" ? OWNER_DISCORD_ID : role === "owner_dev" ? "1450057724502081607" : role === "admin" ? "1443210704332263440" : role === "staff" ? "1450058093290590218" : "1450058093290590218";
  await createSession({ id, username: `dev-${role}`, global_name: `DEV ${role.toUpperCase()}`, avatar: null });
  return NextResponse.redirect(`${SITE_URL}/profile`);
}
