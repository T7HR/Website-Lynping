import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";

export async function GET() {
  const { session } = await requireUser("user");
  const results = await getAuctionResults();
  return NextResponse.json({ wins: Object.entries<any>(results).filter(([, r]) => String(r.winner_id || r?.close_summary?.winner_id || "") === session.id) });
}
