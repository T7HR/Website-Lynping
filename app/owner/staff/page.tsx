import { PageHeader } from "@/components/PageHeader";
import { AddStaffForm, DeleteButton } from "@/components/OwnerForms";
import { requireUser } from "@/lib/authGuard";
import { getWebSettings, getWebStaffCommands } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";

export default async function OwnerStaffPage() {
  await requireUser("owner");
  const [settings, commandQueue] = await Promise.all([getWebSettings(), getWebStaffCommands()]);
  const staff = Object.values(settings.staff).filter(s => s.enabled !== false);
  const pendingCommands = commandQueue.commands.filter(cmd => !cmd.processed_at && cmd.status !== "processed");
  const staffProfiles = await withDiscordProfiles(staff.map(s => ({ discordId: s.id, count: 0 })), staff.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการ Staff"
        description="รายชื่อที่แสดงมาจาก STAFF_WAITING_CATEGORY_MAP ของบอทที่ mirror กลับมา ส่วนการเพิ่ม/ลบจากเว็บจะเข้าคิว web_staff_commands.json แล้วบอทค่อย merge เข้า config.json เพื่อไม่ให้ข้อมูลชนกัน"
      />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AddStaffForm />
        <div className="space-y-4">
          {pendingCommands.length > 0 && (
            <div className="card divide-y divide-white/10 overflow-hidden">
              <div className="p-5">
                <p className="panel-title">Pending Sync</p>
                <h2 className="mt-1 text-lg font-black">คำสั่งที่รอบอทประมวลผล</h2>
                <p className="mt-1 text-sm text-zinc-400">หลังบอท sync แล้ว รายชื่อจริงจะอัปเดตจาก STAFF_WAITING_CATEGORY_MAP กลับมาแสดงด้านล่าง</p>
              </div>
              {pendingCommands.map(cmd => (
                <div key={cmd.id} className="owner-list-row flex items-center justify-between gap-4 p-5 text-sm">
                  <div>
                    <p className="font-bold">{cmd.action === "remove_staff" ? "ลบ" : "เพิ่ม/แก้ไข"} <span className="text-zinc-300">{cmd.staff_id}</span></p>
                    <p className="text-zinc-400">waiting category: {cmd.waiting_category_id || "ใช้ค่าเดิม/ค่า default"}</p>
                  </div>
                  <span className="rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-100">pending</span>
                </div>
              ))}
            </div>
          )}

          <div className="card divide-y divide-white/10 overflow-hidden">
            <div className="p-5">
              <p className="panel-title">Bot Source of Truth</p>
              <h2 className="mt-1 text-lg font-black">รายชื่อ Staff จาก STAFF_WAITING_CATEGORY_MAP</h2>
            </div>
            {staff.map(s => {
              const profile = staffProfiles.find(row => row.discordId === s.id);
              return (
                <div key={s.id} className="owner-list-row flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03]">
                  <div className="owner-list-user flex min-w-0 items-center gap-3">
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
            {staff.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี Staff ที่บอท mirror กลับมา</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
