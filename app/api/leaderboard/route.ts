import { NextResponse } from "next/server";
import { getAuctionStats } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { toLeaderboardRows } from "@/lib/leaderboard";

export async function GET() {
  const stats = await getAuctionStats();
  const [sellers, winners] = await Promise.all([
    withDiscordProfiles(toLeaderboardRows(stats, "sellers"), null),
    withDiscordProfiles(toLeaderboardRows(stats, "winners"), null),
  ]);
  return NextResponse.json({ sellers, winners });
}
