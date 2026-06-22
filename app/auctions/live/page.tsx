import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";
import { getOpenAuctionItems } from "@/lib/auctionDisplay";

export default async function LiveAuctionsPage() {
  await requireUser("user");
  const rows = getOpenAuctionItems(await getAuctionRequests());
  return (
    <div className="space-y-6">
      <PageHeader title="รายการประมูลที่เปิดอยู่" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีรายการประมูลที่เปิดอยู่" />
    </div>
  );
}
