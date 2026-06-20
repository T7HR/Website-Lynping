import { PageHeader } from "@/components/PageHeader";
import { AddAdminForm, DeleteButton } from "@/components/OwnerForms";
import { requireUser } from "@/lib/authGuard";
import { getWebSettings } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";

export default async function OwnerAdminsPage() {
  await requireUser("owner");
  const settings = await getWebSettings();
  const admins = Object.values(settings.admins);
  const adminProfiles = await withDiscordProfiles(admins.map(a => ({ discordId: a.id, count: 0 })), admins.length);
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการ Admin" description="เพิ่ม Admin ด้วย Discord user ID ข้อมูลจะถูกบันทึกใน web_bot_settings.json และ auction_users.json" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AddAdminForm />
        <div className="card divide-y divide-white/10 overflow-hidden">
          {admins.map(a => {
            const profile = adminProfiles.find(row => row.discordId === a.id);
            return (
              <div key={a.id} className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03]">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={profile?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png"} alt={profile?.displayName || a.id} className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h2 className="truncate font-black">{profile?.displayName || a.id}</h2>
                    <p className="text-sm text-zinc-400">{a.note || "ไม่มี note"} • {a.enabled ? "enabled" : "disabled"}</p>
                  </div>
                </div>
                <DeleteButton url={`/api/owner/admins/${a.id}`} />
              </div>
            );
          })}
          {admins.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี Admin เพิ่มเติม</p>}
        </div>
      </div>
    </div>
  );
}
