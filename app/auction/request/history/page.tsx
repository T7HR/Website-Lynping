import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export default async function RequestHistoryPage() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  const rows = Object.values<any>(requests).filter(x => String(x.requester_id) === session.id);
  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติคำขอลงประมูลของฉัน" />
      <div className="card overflow-hidden">{rows.map(row => <div key={row.id} className="border-b border-white/10 p-5"><b>{row.name}</b><p className="text-sm text-zinc-400">{row.status} • {row.created_at}</p></div>)}</div>
    </div>
  );
}
