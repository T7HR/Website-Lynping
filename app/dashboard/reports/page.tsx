import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getDailyReport, getStaffBonus, getStaffShop } from "@/lib/auctionStore";

export default async function ReportsPage() {
  await requireUser("staff");
  const [daily, shop, bonus] = await Promise.all([getDailyReport(), getStaffShop(), getStaffBonus()]);
  return (
    <div className="space-y-6">
      <PageHeader title="รายงานรวม" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5"><h2 className="font-bold">Daily Report</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(daily, null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">Staff Shop</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(shop, null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">Staff Bonus</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(bonus, null, 2)}</pre></div>
      </div>
    </div>
  );
}
