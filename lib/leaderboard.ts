import type { AuctionStatsPayload } from "@/lib/types";

export type LeaderboardRow = {
  discordId: string;
  count: number;
  displayName?: string;
  avatarUrl?: string;
};

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

export function getMyRank(rows: LeaderboardRow[], discordId: string) {
  const index = rows.findIndex(row => row.discordId === discordId);
  return index >= 0 ? index + 1 : null;
}
