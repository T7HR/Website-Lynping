import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

const COOKIE_NAME = "auction_session";

export async function GET(req: Request) {
  await destroySession();
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST() {
  await destroySession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
