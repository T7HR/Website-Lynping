import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function MyAuctionsPage() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  const mine = Object.values<any>(requests).filter(x => String(x.requester_id) === session.id);
  const rows = toAuctionCardItems(mine);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการที่ฉันลงประมูล" description="อ้างอิงจาก auction_requests.json" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีรายการ" />
    </div>
  );
}
