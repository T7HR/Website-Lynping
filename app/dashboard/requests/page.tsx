import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function DashboardRequestsPage() {
  await requireUser("staff");
  const requests = toAuctionCardItems(await getAuctionRequests());
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการคำขอลงประมูล" />
      <AuctionCardList items={requests} emptyText="ยังไม่มีคำขอ" />
    </div>
  );
}
