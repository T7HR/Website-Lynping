import { NextResponse } from "next/server";
import { getAuctionStats } from "@/lib/auctionStore";
import { toLeaderboardRows } from "@/lib/leaderboard";

export async function GET() {
  const stats = await getAuctionStats();
  return NextResponse.json({ sellers: toLeaderboardRows(stats, "sellers"), winners: toLeaderboardRows(stats, "winners") });
}
