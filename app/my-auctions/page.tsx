import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export default async function MyAuctionsPage() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  const rows = Object.values<any>(requests).filter(x => String(x.requester_id) === session.id);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการที่ฉันลงประมูล" description="อ้างอิงจาก auction_requests.json" />
      <div className="card overflow-hidden">
        {rows.map(row => <div key={row.id} className="border-b border-white/10 p-5"><h2 className="font-bold">{row.name}</h2><p className="text-sm text-zinc-400">สถานะ: {row.status} • ราคาเปิด {row.open_price} • เวลาปิด {row.close_time}</p></div>)}
        {rows.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มีรายการ</p>}
      </div>
    </div>
  );
}
