import { PageHeader } from "@/components/PageHeader";
import { AddAdminForm, DeleteButton } from "@/components/OwnerForms";
import { requireUser } from "@/lib/authGuard";
import { getWebSettings } from "@/lib/auctionStore";

export default async function OwnerAdminsPage() {
  await requireUser("owner");
  const settings = await getWebSettings();
  const admins = Object.values(settings.admins);
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการ Admin" description="เพิ่ม Admin ด้วย Discord user ID ข้อมูลจะถูกบันทึกใน web_bot_settings.json และ auction_users.json" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AddAdminForm />
        <div className="card divide-y divide-white/10 overflow-hidden">
          {admins.map(a => <div key={a.id} className="flex items-center justify-between gap-4 p-5"><div><h2 className="font-bold">&lt;@{a.id}&gt;</h2><p className="text-sm text-zinc-400">{a.note || "ไม่มี note"} • {a.enabled ? "enabled" : "disabled"}</p></div><DeleteButton url={`/api/owner/admins/${a.id}`} /></div>)}
          {admins.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี Admin เพิ่มเติม</p>}
        </div>
      </div>
    </div>
  );
}
