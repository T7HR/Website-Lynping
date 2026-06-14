import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuditLogs } from "@/lib/auctionStore";

export default async function OwnerLogsPage() {
  await requireUser("owner");
  const logs = await getAuditLogs();
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="บันทึก action ที่ทำผ่านเว็บ" />
      <div className="card divide-y divide-white/10">
        {logs.map(log => <div key={log.id} className="p-5"><b>{log.action}</b><p className="text-sm text-zinc-400">actor: {log.actor_id} • target: {log.target_id || "-"} • {log.created_at}</p><p className="text-sm text-zinc-500">{log.detail}</p></div>)}
        {logs.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี log</p>}
      </div>
    </div>
  );
}
