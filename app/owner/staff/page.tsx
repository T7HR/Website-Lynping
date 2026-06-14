import { PageHeader } from "@/components/PageHeader";
import { AddStaffForm, DeleteButton } from "@/components/OwnerForms";
import { requireUser } from "@/lib/authGuard";
import { getWebSettings } from "@/lib/auctionStore";

export default async function OwnerStaffPage() {
  await requireUser("owner");
  const settings = await getWebSettings();
  const staff = Object.values(settings.staff);
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการ Staff" description="สำหรับบอท main.py ต้องมี bot patch เพื่อดึง staff จาก web_bot_settings.json แล้วอัปเดต STAFF_WAITING_CATEGORY_MAP" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AddStaffForm />
        <div className="card divide-y divide-white/10 overflow-hidden">
          {staff.map(s => <div key={s.id} className="flex items-center justify-between gap-4 p-5"><div><h2 className="font-bold">&lt;@{s.id}&gt;</h2><p className="text-sm text-zinc-400">waiting category: {s.waiting_category_id || "-"} • {s.note || "ไม่มี note"}</p></div><DeleteButton url={`/api/owner/staff/${s.id}`} /></div>)}
          {staff.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี Staff</p>}
        </div>
      </div>
    </div>
  );
}
