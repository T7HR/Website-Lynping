import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function ClosedAuctionsPage() {
  await requireUser("user");
  const rows = toAuctionCardItems(await getAuctionResults());
  return (
    <div className="space-y-6">
      <PageHeader title="รายการประมูลที่ปิดแล้ว" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีรายการประมูลที่ปิดแล้ว" />
    </div>
  );
}
