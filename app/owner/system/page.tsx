import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { listMirrorRows } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLE } from "@/lib/env";

export default async function OwnerSystemPage() {
  await requireUser("owner");
  const rows = await listMirrorRows();
  return (
    <div className="space-y-6">
      <PageHeader title="System Integration" description={`Supabase table: ${SUPABASE_TABLE}`} />
      <div className="card overflow-hidden">
        {rows.map((row: any) => <div key={row.key} className="flex items-center justify-between gap-4 border-b border-white/10 p-5"><div><b>{row.key}</b><p className="text-sm text-zinc-400">{row.file_name}</p></div><span className="text-xs text-zinc-500">{row.updated_at}</span></div>)}
        {rows.length === 0 && <p className="p-5 text-zinc-400">ยังไม่พบข้อมูล หรือยังไม่ได้ตั้ง Supabase env</p>}
      </div>
    </div>
  );
}
