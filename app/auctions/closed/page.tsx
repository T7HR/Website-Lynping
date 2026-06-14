import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";

export default async function ClosedAuctionsPage() {
  await requireUser("user");
  const rows = Object.entries<any>(await getAuctionResults());
  return <div><PageHeader title="รายการประมูลที่ปิดแล้ว" /><div className="card p-5"><pre className="overflow-auto text-xs text-zinc-400">{JSON.stringify(rows, null, 2)}</pre></div></div>;
}
