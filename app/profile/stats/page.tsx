import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults, getAuctionStats, getAuctionUserEarnings } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";
import { getMyRank, toLeaderboardRows } from "@/lib/leaderboard";

export default async function ProfileStatsPage() {
  const { session } = await requireUser("user");
  const [stats, requests, results, earnings] = await Promise.all([getAuctionStats(), getAuctionRequests(), getAuctionResults(), getAuctionUserEarnings()]);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  const sellerCount = sellers.find(x => x.discordId === session.id)?.count || 0;
  const winnerCount = winners.find(x => x.discordId === session.id)?.count || 0;
  const myRequests = toAuctionCardItems(Object.values<any>(requests).filter(x => String(x.requester_id) === session.id)).slice(0, 5);
  const myWins = toAuctionCardItems(Object.values<any>(results).filter(x => String(x.winner_id || x?.close_summary?.winner_id || "") === session.id)).slice(0, 5);
  const winRate = sellerCount > 0 ? Math.round((winnerCount / sellerCount) * 100) : 0;
  const myEarnings = earnings.users[session.id];
  const sellerEarning = myEarnings?.total_customer_amount || 0;
  const winningBidAmount = myEarnings?.total_winning_bid_amount || 0;
  return (
    <div className="space-y-6">
      <PageHeader title="สถิติของฉัน" description="นับจากข้อมูล JSON mirror ที่บอท sync ขึ้น Supabase" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <StatCard label="ลงของทั้งหมด" value={sellerCount} />
        <StatCard label="ชนะทั้งหมด" value={winnerCount} />
        <StatCard label="ยอดที่ได้จากการลงประมูลทั้งหมด" value={sellerEarning.toLocaleString("en-US")} />
        <StatCard label="ยอดที่ลงประมูลทั้งหมด" value={winningBidAmount.toLocaleString("en-US")} />
        <StatCard label="อันดับลงของ" value={getMyRank(sellers, session.id) || "-"} />
        <StatCard label="อันดับชนะ" value={getMyRank(winners, session.id) || "-"} />
        <StatCard label="Win rate" value={`${winRate}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="panel-title">คำขอล่าสุด</h2>
          <AuctionCardList items={myRequests} emptyText="ยังไม่มีคำขอ" />
        </section>
        <section className="space-y-4">
          <h2 className="panel-title">ชนะล่าสุด</h2>
          <AuctionCardList items={myWins} emptyText="ยังไม่มีรายการที่ชนะ" />
        </section>
      </div>
    </div>
  );
}
