import type { AuctionCardItem } from "@/lib/auctionDisplay";

export function AuctionCardList({ items, emptyText }: { items: AuctionCardItem[]; emptyText: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map(item => (
        <article key={item.id} className="card overflow-hidden">
          <div className="auction-card-image aspect-[16/7] w-full overflow-hidden border-b border-white/10 bg-zinc-950">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sm text-zinc-500">ไม่มีรูปสินค้า</div>
            )}
          </div>
          <div className="auction-card-body space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="panel-title">Auction Item</p>
                <h2 className="mt-1 text-xl font-black">{item.name}</h2>
              </div>
              <span className="badge">{item.status}</span>
            </div>
            <div className="auction-metrics grid gap-3 sm:grid-cols-4">
              <Metric label="เปิด" value={item.openPrice} />
              <Metric label="บิด" value={item.stepPrice} />
              <Metric label="ทุบ" value={item.buyoutPrice} />
              <Metric label="เวลาปิด" value={item.closeTime} />
            </div>
          </div>
        </article>
      ))}
      {items.length === 0 && (
        <div className="card p-6 text-sm text-zinc-400">{emptyText}</div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words font-black text-white">{value}</p>
    </div>
  );
}
