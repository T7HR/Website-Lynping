import type { AuctionStatsPayload } from "@/lib/types";

export function toLeaderboardRows(stats: AuctionStatsPayload, type: "sellers" | "winners") {
  const raw = stats[type] || {};
  return Object.entries(raw)
    .map(([discordId, info]) => ({
      discordId,
      count: Number(info?.count || 0),
    }))
    .filter(row => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getMyRank(rows: { discordId: string; count: number }[], discordId: string) {
  const index = rows.findIndex(row => row.discordId === discordId);
  return index >= 0 ? index + 1 : null;
}
