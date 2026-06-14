import { NextResponse } from "next/server";
import { buildDiscordLoginUrl } from "@/lib/discordOAuth";

export async function GET() {
  const url = await buildDiscordLoginUrl();
  return NextResponse.redirect(url);
}
