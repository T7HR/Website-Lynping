import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { requireUser } from "@/lib/authGuard";
import { getAuditLogs, getWebSettings } from "@/lib/auctionStore";

export default async function OwnerPage() {
  await requireUser("owner");
  const [settings, logs] = await Promise.all([getWebSettings(), getAuditLogs()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Owner Control Center" description="จัดการ Admin / Staff ผ่าน Discord user ID และเขียนเข้า Supabase table เดียวกับบอท" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Owner ID" value={settings.owner_id} />
        <StatCard label="Admin" value={Object.keys(settings.admins).length} />
        <StatCard label="Staff" value={Object.keys(settings.staff).length} />
        <StatCard label="Action logs" value={logs.length} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Link className="card p-5 hover:bg-white/[0.08]" href="/owner/admins"><h2 className="font-bold">จัดการ Admin</h2><p className="text-sm text-zinc-400">เพิ่ม/ลบ Admin ด้วย Discord user ID</p></Link>
        <Link className="card p-5 hover:bg-white/[0.08]" href="/owner/staff"><h2 className="font-bold">จัดการ Staff</h2><p className="text-sm text-zinc-400">เพิ่ม Staff และ waiting category สำหรับบอท</p></Link>
        <Link className="card p-5 hover:bg-white/[0.08]" href="/owner/logs"><h2 className="font-bold">Audit Logs</h2><p className="text-sm text-zinc-400">ประวัติการจัดการหลังบ้าน</p></Link>
        <Link className="card p-5 hover:bg-white/[0.08]" href="/owner/system"><h2 className="font-bold">System Integration</h2><p className="text-sm text-zinc-400">ตรวจสถานะ Supabase / JSON mirror</p></Link>
      </div>
    </div>
  );
}
