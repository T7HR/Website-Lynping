import { PageHeader } from "@/components/PageHeader";
import { AddStaffForm, DeleteButton } from "@/components/OwnerForms";
import { requireUser } from "@/lib/authGuard";
import { getWebSettings } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";

export default async function OwnerStaffPage() {
  await requireUser("owner");
  const settings = await getWebSettings();
  const staff = Object.values(settings.staff);
  const staffProfiles = await withDiscordProfiles(staff.map(s => ({ discordId: s.id, count: 0 })), staff.length);
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการ Staff" description="สำหรับบอท main.py ต้องมี bot patch เพื่อดึง staff จาก web_bot_settings.json แล้วอัปเดต STAFF_WAITING_CATEGORY_MAP" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AddStaffForm />
        <div className="card divide-y divide-white/10 overflow-hidden">
          {staff.map(s => {
            const profile = staffProfiles.find(row => row.discordId === s.id);
            return (
              <div key={s.id} className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03]">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={profile?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png"} alt={profile?.displayName || s.id} className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h2 className="truncate font-black">{profile?.displayName || s.id}</h2>
                    <p className="text-sm text-zinc-400">waiting category: {s.waiting_category_id || "-"} • {s.note || "ไม่มี note"}</p>
                  </div>
                </div>
                <DeleteButton url={`/api/owner/staff/${s.id}`} />
              </div>
            );
          })}
          {staff.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี Staff</p>}
        </div>
      </div>
    </div>
  );
}
