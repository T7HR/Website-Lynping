import { PageHeader } from "@/components/PageHeader";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getAuctionStats } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { getMyRank, toLeaderboardRows } from "@/lib/leaderboard";
import { getSession } from "@/lib/session";

export default async function LeaderboardPage() {
  const [stats, session] = await Promise.all([getAuctionStats(), getSession()]);
  const [sellers, winners] = await Promise.all([
    withDiscordProfiles(toLeaderboardRows(stats, "sellers"), null),
    withDiscordProfiles(toLeaderboardRows(stats, "winners"), null),
  ]);
  const sellerRank = session ? getMyRank(sellers, session.id) : null;
  const winnerRank = session ? getMyRank(winners, session.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scoreboard อันดับประมูล"
        description="ข้อมูลจากภายในร้านประมูล Lynping แบบ Realtime"
        actions={
          <div className="grid gap-3 sm:grid-cols-2">
            <MyRankCard label="อันดับลงของประมูลของคุณ" value={sellerRank} />
            <MyRankCard label="อันดับชนะประมูลของคุณ" value={winnerRank} />
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable title="Top ลงของประมูล" rows={sellers} unit="ครั้ง" limit={null} scroll currentDiscordId={session?.id} />
        <LeaderboardTable title="Top ชนะประมูล" rows={winners} unit="ครั้ง" limit={null} scroll currentDiscordId={session?.id} />
      </div>
    </div>
  );
}

function MyRankCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="card min-w-44 p-4">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-red-300">{value ? `#${value}` : "-"}</p>
    </div>
  );
}
