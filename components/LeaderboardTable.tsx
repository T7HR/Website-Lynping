export function LeaderboardTable({ title, rows, unit }: { title: string; rows: { discordId: string; count: number }[]; unit: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="divide-y divide-white/10">
        {rows.slice(0, 10).map((row, index) => (
          <div key={row.discordId} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 font-black">#{index + 1}</div>
              <div>
                <p className="font-semibold">&lt;@{row.discordId}&gt;</p>
                <p className="text-xs text-zinc-500">Discord ID: {row.discordId}</p>
              </div>
            </div>
            <p className="text-lg font-black text-indigo-300">{row.count} {unit}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="p-5 text-sm text-zinc-400">ยังไม่มีข้อมูลจาก auction_stats.json</p>}
      </div>
    </div>
  );
}
