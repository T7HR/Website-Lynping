import { NextRequest, NextResponse } from "next/server";
import { assertOAuthState, exchangeCodeForUser } from "@/lib/discordOAuth";
import { createSession } from "@/lib/session";
import { SITE_URL } from "@/lib/env";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !(await assertOAuthState(state))) {
    return NextResponse.redirect(`${SITE_URL}/login?error=oauth_state`);
  }

  try {
    const user = await exchangeCodeForUser(code);
    await createSession(user);
    return NextResponse.redirect(`${SITE_URL}/profile`);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${SITE_URL}/login?error=discord`);
  }
}
