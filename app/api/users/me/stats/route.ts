import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAuctionStats } from "@/lib/auctionStore";
import { getMyRank, toLeaderboardRows } from "@/lib/leaderboard";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const stats = await getAuctionStats();
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  return NextResponse.json({
    seller_count: sellers.find(x => x.discordId === session.id)?.count || 0,
    winner_count: winners.find(x => x.discordId === session.id)?.count || 0,
    seller_rank: getMyRank(sellers, session.id),
    winner_rank: getMyRank(winners, session.id),
  });
}
