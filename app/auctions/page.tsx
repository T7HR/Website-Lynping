import { AuctionCardList } from "@/components/AuctionCardList";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults, getAuctionRequests } from "@/lib/auctionStore";
import { toAuctionCardItems } from "@/lib/auctionDisplay";

export default async function AuctionsPage() {
  await requireUser("user");
  const [requests, results] = await Promise.all([getAuctionRequests(), getAuctionResults()]);
  const requestRows = toAuctionCardItems(requests);
  const resultRows = toAuctionCardItems(results);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการประมูลทั้งหมด" description="รวมข้อมูลจาก auction_requests.json และ auction_results.json" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="panel-title">คำขอ / รายการรอ</h2>
          <AuctionCardList items={requestRows.slice(0, 20)} emptyText="ยังไม่มีคำขอหรือรายการรอ" />
        </section>
        <section className="space-y-4">
          <h2 className="panel-title">รายการปิดเคส</h2>
          <AuctionCardList items={resultRows.slice(0, 20)} emptyText="ยังไม่มีรายการปิดเคส" />
        </section>
      </div>
    </div>
  );
}
