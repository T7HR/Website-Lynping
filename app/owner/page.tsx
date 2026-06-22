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
        <OwnerLink href="/owner/admins" title="จัดการ Admin" text="เพิ่ม/ลบ Admin ด้วย Discord user ID" />
        <OwnerLink href="/owner/staff" title="จัดการ Staff" text="เพิ่ม Staff และ waiting category สำหรับบอท" />
        <OwnerLink href="/owner/logs" title="Audit Logs" text="ประวัติการจัดการหลังบ้าน" />
        <OwnerLink href="/owner/system" title="System Integration" text="ตรวจสถานะ Supabase / JSON mirror" />
      </div>
    </div>
  );
}

function OwnerLink({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link className="card block p-5 hover:border-red-400/30 hover:bg-red-500/5" href={href}>
      <p className="panel-title">Owner</p>
      <h2 className="mt-1 font-black">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{text}</p>
    </Link>
  );
}
