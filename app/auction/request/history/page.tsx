import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function RequestHistoryPage() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  const rows = toAuctionCardItems(Object.values<any>(requests).filter(x => String(x.requester_id) === session.id));
  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติคำขอลงประมูลของฉัน" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีประวัติคำขอ" />
    </div>
  );
}
