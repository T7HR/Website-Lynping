import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults, getAuctionStats, getStaffBonus, getStaffShop } from "@/lib/auctionStore";
import { toLeaderboardRows } from "@/lib/leaderboard";

export default async function DashboardPage() {
  await requireUser("staff");
  const [requests, results, stats, shop, bonus] = await Promise.all([getAuctionRequests(), getAuctionResults(), getAuctionStats(), getStaffShop(), getStaffBonus()]);
  const requestRows = Object.values<any>(requests);
  const open = requestRows.filter(x => x.status === "pending").length;
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="ข้อมูลรวมจาก Supabase JSON mirror เดียวกับบอท" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="ประมูลที่เปิด/รอ" value={open} />
        <StatCard label="คำขอทั้งหมด" value={requestRows.length} />
        <StatCard label="เคสปิดแล้ว" value={Object.keys(results).length} />
        <StatCard label="Top ผู้ลงของ" value={sellers[0]?.count || 0} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">Top ลงของ</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(sellers.slice(0,5), null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">Top ชนะ</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(winners.slice(0,5), null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">Staff Shop</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(shop, null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">Staff Bonus</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(bonus, null, 2)}</pre></div>
      </div>
    </div>
  );
}
