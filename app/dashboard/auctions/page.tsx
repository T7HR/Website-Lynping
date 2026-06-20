import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";
import { getOpenAuctionItems } from "@/lib/auctionDisplay";

export default async function DashboardAuctionsPage() {
  await requireUser("staff");
  const rows = getOpenAuctionItems(await getAuctionRequests());
  return (
    <div className="space-y-6">
      <PageHeader title="จัดการรายการประมูล" description="แสดงเฉพาะห้องที่สถานะเปิดอยู่" />
      <AuctionCardList items={rows} emptyText="ยังไม่มีห้องที่เปิดอยู่" />
    </div>
  );
}
