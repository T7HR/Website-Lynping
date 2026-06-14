import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export default async function LiveAuctionsPage() {
  await requireUser("user");
  const rows = Object.values<any>(await getAuctionRequests()).filter(x => ["pending", "approved", "open"].includes(String(x.status)));
  return <div><PageHeader title="รายการประมูลที่เปิดอยู่" /><div className="card p-5"><pre className="overflow-auto text-xs text-zinc-400">{JSON.stringify(rows, null, 2)}</pre></div></div>;
}
