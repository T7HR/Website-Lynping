import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SITE_URL } from "@/lib/env";
import type { DiscordSession } from "@/lib/types";

const DISCORD_API = "https://discord.com/api/v10";
const STATE_COOKIE = "discord_oauth_state";

export async function buildDiscordLoginUrl() {
  const state = crypto.randomBytes(24).toString("hex");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${SITE_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DISCORD_CLIENT_ID || "",
    scope: "identify guilds",
    redirect_uri: redirectUri,
    state,
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function assertOAuthState(state: string | null) {
  const jar = await cookies();
  const saved = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  return Boolean(saved && state && saved === state);
}

export async function exchangeCodeForUser(code: string): Promise<DiscordSession> {
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${SITE_URL}/api/auth/callback`;
  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    throw new Error(`Discord token exchange failed: ${tokenRes.status}`);
  }

  const token = await tokenRes.json();
  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });

  if (!userRes.ok) {
    throw new Error(`Discord user fetch failed: ${userRes.status}`);
  }

  const user = await userRes.json();
  return {
    id: String(user.id),
    username: String(user.username || "discord-user"),
    global_name: user.global_name || null,
    avatar: user.avatar || null,
  };
}
