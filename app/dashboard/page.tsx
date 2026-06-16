import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StaffMoneyCard } from "@/components/ReportCards";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults, getAuctionStats, getStaffBonus, getStaffShop } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { toLeaderboardRows } from "@/lib/leaderboard";
import { toStaffMoneyRows } from "@/lib/reportDisplay";

export default async function DashboardPage() {
  const { settings } = await requireUser("staff");
  const [requests, results, stats, shop, bonus] = await Promise.all([getAuctionRequests(), getAuctionResults(), getAuctionStats(), getStaffShop(), getStaffBonus()]);
  const requestRows = Object.values<any>(requests);
  const open = requestRows.filter(x => x.status === "pending").length;
  const [sellers, winners, shopRows, bonusRows] = await Promise.all([
    withDiscordProfiles(toLeaderboardRows(stats, "sellers").slice(0, 5), 5),
    withDiscordProfiles(toLeaderboardRows(stats, "winners").slice(0, 5), 5),
    withDiscordProfiles(toStaffMoneyRows(shop, Object.keys(settings.staff)), 6),
    withDiscordProfiles(toStaffMoneyRows(bonus, Object.keys(settings.staff)), 6),
  ]);
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
        <LeaderboardTable title="Top ลงของ" rows={sellers} unit="ครั้ง" />
        <LeaderboardTable title="Top ชนะ" rows={winners} unit="ครั้ง" />
        <StaffMoneyCard title="ยอดค้างชำระร้าน" rows={shopRows} emptyText="ยังไม่มีข้อมูลยอดค้างชำระ" />
        <StaffMoneyCard title="โบนัสพนักงาน" rows={bonusRows} emptyText="ยังไม่มีข้อมูลโบนัส" />
      </div>
    </div>
  );
}
