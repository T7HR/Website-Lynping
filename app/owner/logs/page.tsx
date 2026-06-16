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
        {logs.map(log => (
          <div key={log.id} className="grid gap-3 p-5 hover:bg-white/[0.03] md:grid-cols-[1fr_auto]">
            <div>
              <p className="panel-title">Action</p>
              <b className="mt-1 block text-lg">{log.action}</b>
              <p className="mt-2 text-sm text-zinc-500">{log.detail}</p>
            </div>
            <div className="text-sm text-zinc-400 md:text-right">
              <p>actor: {log.actor_id}</p>
              <p>target: {log.target_id || "-"}</p>
              <p className="text-zinc-500">{log.created_at}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มี log</p>}
      </div>
    </div>
  );
}
