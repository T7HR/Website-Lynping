import { NextResponse } from "next/server";
import { buildDiscordLoginUrl } from "@/lib/discordOAuth";
import { SITE_URL } from "@/lib/env";

export async function GET() {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(`${SITE_URL}/login?error=missing_discord_env`);
  }

  const url = await buildDiscordLoginUrl();
  return NextResponse.redirect(url);
}
