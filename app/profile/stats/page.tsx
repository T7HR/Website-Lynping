import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults, getAuctionStats } from "@/lib/auctionStore";
import { getMyRank, toLeaderboardRows } from "@/lib/leaderboard";

export default async function ProfileStatsPage() {
  const { session } = await requireUser("user");
  const [stats, requests, results] = await Promise.all([getAuctionStats(), getAuctionRequests(), getAuctionResults()]);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  const sellerCount = sellers.find(x => x.discordId === session.id)?.count || 0;
  const winnerCount = winners.find(x => x.discordId === session.id)?.count || 0;
  const myRequests = Object.values<any>(requests).filter(x => String(x.requester_id) === session.id);
  const myWins = Object.values<any>(results).filter(x => String(x.winner_id || x?.close_summary?.winner_id || "") === session.id);
  const winRate = sellerCount > 0 ? Math.round((winnerCount / sellerCount) * 100) : 0;
  return (
    <div className="space-y-6">
      <PageHeader title="สถิติของฉัน" description="นับจากข้อมูล JSON mirror ที่บอท sync ขึ้น Supabase" />
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="ลงของทั้งหมด" value={sellerCount} />
        <StatCard label="ชนะทั้งหมด" value={winnerCount} />
        <StatCard label="อันดับลงของ" value={getMyRank(sellers, session.id) || "-"} />
        <StatCard label="อันดับชนะ" value={getMyRank(winners, session.id) || "-"} />
        <StatCard label="Win rate" value={`${winRate}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">คำขอล่าสุด</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(myRequests.slice(0,5), null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">ชนะล่าสุด</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(myWins.slice(0,5), null, 2)}</pre></div>
      </div>
    </div>
  );
}
