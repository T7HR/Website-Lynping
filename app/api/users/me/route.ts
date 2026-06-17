import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAuctionResults, getAuctionStats, getWebSettings, syncSellerEarningsFromResults } from "@/lib/auctionStore";
import { toLeaderboardRows, getMyRank } from "@/lib/leaderboard";
import { getRoleForDiscordId } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [stats, settings, results] = await Promise.all([getAuctionStats(), getWebSettings(), getAuctionResults()]);
  const earnings = await syncSellerEarningsFromResults(results);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  return NextResponse.json({
    user: session,
    role: await getRoleForDiscordId(session.id, settings),
    stats: {
      seller_count: sellers.find(x => x.discordId === session.id)?.count || 0,
      winner_count: winners.find(x => x.discordId === session.id)?.count || 0,
      seller_customer_amount: earnings.users[session.id]?.total_customer_amount || 0,
      seller_rank: getMyRank(sellers, session.id),
      winner_rank: getMyRank(winners, session.id),
    },
  });
}
