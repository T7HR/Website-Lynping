import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export default async function DashboardRequestsPage() {
  await requireUser("staff");
  const requests = Object.values<any>(await getAuctionRequests()).sort((a,b) => String(b.created_at).localeCompare(String(a.created_at)));
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการคำขอลงประมูล" />
      <div className="card divide-y divide-white/10">
        {requests.map(row => <div key={row.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-bold">{row.name}</h2><p className="text-sm text-zinc-400">ผู้ส่ง: &lt;@{row.requester_id}&gt; • {row.created_at}</p></div><span className="badge">{row.status}</span></div><pre className="mt-3 overflow-auto text-xs text-zinc-500">{JSON.stringify(row, null, 2)}</pre></div>)}
        {requests.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มีคำขอ</p>}
      </div>
    </div>
  );
}
