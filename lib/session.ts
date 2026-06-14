import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { DiscordSession } from "@/lib/types";

const COOKIE_NAME = "auction_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession(user: DiscordSession) {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<DiscordSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DiscordSession;
  } catch {
    return null;
  }
}

export function avatarUrl(user: DiscordSession | null, size = 128) {
  if (!user) return null;
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
}
