import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";

export default async function MyWinsPage() {
  const { session } = await requireUser("user");
  const results = await getAuctionResults();
  const rows = Object.entries<any>(results).filter(([, row]) => String(row.winner_id || row?.close_summary?.winner_id || "") === session.id);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการที่ฉันชนะประมูล" description="อ้างอิงจาก auction_results.json" />
      <div className="card overflow-hidden">
        {rows.map(([id, row]) => <div key={id} className="border-b border-white/10 p-5"><h2 className="font-bold">{row.item_name || row.name || `Auction ${id}`}</h2><p className="text-sm text-zinc-400">ราคาจบ: {row.final_price || row?.close_summary?.final_price || "-"}</p></div>)}
        {rows.length === 0 && <p className="p-5 text-zinc-400">ยังไม่มีรายการที่ชนะ</p>}
      </div>
    </div>
  );
}
