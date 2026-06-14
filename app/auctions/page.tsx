import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults, getAuctionRequests } from "@/lib/auctionStore";

export default async function AuctionsPage() {
  await requireUser("user");
  const [requests, results] = await Promise.all([getAuctionRequests(), getAuctionResults()]);
  const requestRows = Object.values<any>(requests);
  const resultRows = Object.entries<any>(results);
  return (
    <div className="space-y-6">
      <PageHeader title="รายการประมูลทั้งหมด" description="รวมข้อมูลจาก auction_requests.json และ auction_results.json" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">คำขอ/รายการรอ</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(requestRows.slice(0,20), null, 2)}</pre></div>
        <div className="card p-5"><h2 className="font-bold">รายการปิดเคส</h2><pre className="mt-4 overflow-auto text-xs text-zinc-400">{JSON.stringify(resultRows.slice(0,20), null, 2)}</pre></div>
      </div>
    </div>
  );
}
