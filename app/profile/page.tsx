import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/authGuard";
import { avatarUrl } from "@/lib/session";
import { getAuctionResults, getAuctionStats, syncSellerEarningsFromResults } from "@/lib/auctionStore";
import { getMyRank, toLeaderboardRows } from "@/lib/leaderboard";
import { roleLabel } from "@/lib/roleLabels";

export default async function ProfilePage() {
  const { session, role } = await requireUser("user");
  const [stats, results] = await Promise.all([getAuctionStats(), getAuctionResults()]);
  const earnings = await syncSellerEarningsFromResults(results);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  const img = avatarUrl(session, 256);
  const sellerCount = sellers.find(x => x.discordId === session.id)?.count || 0;
  const winnerCount = winners.find(x => x.discordId === session.id)?.count || 0;
  const sellerEarning = earnings.users[session.id]?.total_customer_amount || 0;
  return (
    <div className="space-y-6">
      <PageHeader title="โปรไฟล์ของฉัน" description="ข้อมูลผู้ใช้ภายในเซิร์ฟเวอร์ Lynping" />
      <div className="card flex flex-col gap-5 p-6 md:flex-row md:items-center">
        {img ? <img src={img} alt="avatar" className="h-24 w-24 rounded-lg object-cover" /> : <div className="h-24 w-24 rounded-lg bg-white/10" />}
        <div className="flex-1">
          <h2 className="text-2xl font-black">{session.global_name || session.username}</h2>
          <p className="text-zinc-400">Discord ID: {session.id}</p>
          <p className="mt-2"><span className="badge">Role: {roleLabel(role)}</span></p>
        </div>
        <Link className="btn-primary" href="/profile/stats">ดูสถิติละเอียด</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="ลงของประมูล" value={sellerCount} />
        <StatCard label="ชนะประมูล" value={winnerCount} />
        <StatCard label="ยอดที่ได้จากการลงประมูลทั้งหมด" value={sellerEarning.toLocaleString("en-US")} />
        <StatCard label="อันดับลงของ" value={getMyRank(sellers, session.id) || "-"} />
        <StatCard label="อันดับชนะ" value={getMyRank(winners, session.id) || "-"} />
      </div>
    </div>
  );
}
