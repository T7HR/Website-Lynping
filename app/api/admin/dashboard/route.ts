import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults, getAuctionStats, getDailyReport, getStaffBonus, getStaffShop } from "@/lib/auctionStore";
import { toLeaderboardRows } from "@/lib/leaderboard";

export async function GET() {
  await requireUser("staff");
  const [requests, results, stats, shop, bonus, daily] = await Promise.all([
    getAuctionRequests(), getAuctionResults(), getAuctionStats(), getStaffShop(), getStaffBonus(), getDailyReport(),
  ]);
  const requestList = Object.values<any>(requests);
  const resultList = Object.values<any>(results);
  return NextResponse.json({
    open_requests: requestList.filter(x => x.status === "pending").length,
    total_requests: requestList.length,
    closed_cases: resultList.length,
    seller_top: toLeaderboardRows(stats, "sellers").slice(0, 5),
    winner_top: toLeaderboardRows(stats, "winners").slice(0, 5),
    shop,
    bonus,
    daily,
  });
}
