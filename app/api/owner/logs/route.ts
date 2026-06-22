import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuditLogs } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("owner");
  return NextResponse.json({ logs: await getAuditLogs() });
}
