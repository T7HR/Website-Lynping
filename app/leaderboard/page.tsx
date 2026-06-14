import { PageHeader } from "@/components/PageHeader";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getAuctionStats } from "@/lib/auctionStore";
import { toLeaderboardRows } from "@/lib/leaderboard";

export default async function LeaderboardPage() {
  const stats = await getAuctionStats();
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  return (
    <div className="space-y-6">
      <PageHeader title="Scoreboard อันดับประมูล" description="ข้อมูลนี้ดึงจาก auction_stats.json ใน Supabase row เดียวกับที่บอท main.py sync ขึ้นไป" />
      <div className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable title="Top ลงของประมูล" rows={sellers} unit="ครั้ง" />
        <LeaderboardTable title="Top ชนะประมูล" rows={winners} unit="ครั้ง" />
      </div>
    </div>
  );
}
