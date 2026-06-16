import { DailyReportCard, StaffMoneyCard } from "@/components/ReportCards";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getDailyReport, getStaffBonus, getStaffShop, getWebSettings } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { getEnabledStaffIds, toDailyReportView, toStaffMoneyRows } from "@/lib/reportDisplay";

export default async function ReportsPage() {
  await requireUser("staff");
  const [daily, shop, bonus, settings] = await Promise.all([getDailyReport(), getStaffShop(), getStaffBonus(), getWebSettings()]);
  const staffIds = getEnabledStaffIds(settings);
  const dailyReport = toDailyReportView(daily);
  const [topRoomRows, topAmountRows, shopRows, bonusRows] = await Promise.all([
    withDiscordProfiles(dailyReport.topRoomRows, 3),
    withDiscordProfiles(dailyReport.topAmountRows, 3),
    withDiscordProfiles(toStaffMoneyRows(shop, staffIds), staffIds.length),
    withDiscordProfiles(toStaffMoneyRows(bonus, staffIds), staffIds.length),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="รายงานรวม" />
      <DailyReportCard report={{ ...dailyReport, topRoomRows, topAmountRows }} />
      <div className="grid gap-6 lg:grid-cols-2">
        <StaffMoneyCard title="ยอดค้างชำระร้าน" rows={shopRows} emptyText="ยังไม่มีพนักงานในระบบ หรือยังไม่มียอดค้างชำระร้าน" />
        <StaffMoneyCard title="โบนัสพนักงาน" rows={bonusRows} emptyText="ยังไม่มีพนักงานในระบบ หรือยังไม่มีข้อมูลโบนัส" />
      </div>
    </div>
  );
}
