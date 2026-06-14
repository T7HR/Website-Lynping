import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { SITE_URL } from "@/lib/env";

export async function GET() {
  await destroySession();
  return NextResponse.redirect(`${SITE_URL}/`);
}

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
