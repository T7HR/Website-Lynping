import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAuctionStats, getAuctionUserEarnings, getWebSettings } from "@/lib/auctionStore";
import { toLeaderboardRows, getMyRank } from "@/lib/leaderboard";
import { getRoleForDiscordId } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [stats, settings, earnings] = await Promise.all([getAuctionStats(), getWebSettings(), getAuctionUserEarnings()]);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  const myEarnings = earnings.users[session.id];
  const res = NextResponse.json({
    user: session,
    role: await getRoleForDiscordId(session.id, settings),
    stats: {
      seller_count: sellers.find(x => x.discordId === session.id)?.count || 0,
      winner_count: winners.find(x => x.discordId === session.id)?.count || 0,
      seller_customer_amount: myEarnings?.total_customer_amount || 0,
      winning_bid_amount: myEarnings?.total_winning_bid_amount || 0,
      won_bid_count: myEarnings?.won_bid_count || 0,
      seller_rank: getMyRank(sellers, session.id),
      winner_rank: getMyRank(winners, session.id),
    },
  });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return res;
}
