import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function MyWinsPage() {
  const { session } = await requireUser("user");
  const results = await getAuctionResults();
  const mine = Object.fromEntries(Object.entries<any>(results).filter(([, row]) => String(row.winner_id || row?.close_summary?.winner_id || "") === session.id));
  const rows = toAuctionCardItems(mine);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการที่ฉันชนะประมูล" description="อ้างอิงจาก auction_results.json" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีรายการที่ชนะ" />
    </div>
  );
}
