import type { LeaderboardRow } from "@/lib/leaderboard";

export function LeaderboardTable({
  title,
  rows,
  unit,
  limit = 10,
  scroll = false,
  currentDiscordId,
}: {
  title: string;
  rows: LeaderboardRow[];
  unit: string;
  limit?: number | null;
  scroll?: boolean;
  currentDiscordId?: string;
}) {
  const visibleRows = limit ? rows.slice(0, limit) : rows;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-white/10 p-5">
        <p className="panel-title">Leaderboard</p>
        <h2 className="mt-1 text-xl font-black">{title}</h2>
        <p className="mt-2 text-xs text-zinc-500">ทั้งหมด {rows.length.toLocaleString("en-US")} อันดับ</p>
      </div>
      <div className={`divide-y divide-white/10 ${scroll ? "max-h-[68vh] overflow-y-auto" : ""}`}>
        {visibleRows.map((row, index) => {
          const isCurrentUser = currentDiscordId && row.discordId === currentDiscordId;
          return (
          <div key={row.discordId} className={`flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03] ${isCurrentUser ? "bg-red-500/10 ring-1 ring-inset ring-red-400/25" : ""}`}>
            <div className="flex items-center gap-4">
              <div className="relative h-11 w-11 shrink-0">
                <img
                  src={row.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${index % 6}.png`}
                  alt={row.displayName || row.discordId}
                  className="h-11 w-11 rounded-lg border border-white/10 bg-white/10 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 grid h-5 min-w-5 place-items-center rounded-md bg-red-600 px-1 text-[10px] font-black text-white">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="font-semibold">{row.displayName || row.discordId} {isCurrentUser && <span className="ml-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">คุณ</span>}</p>
                <p className="text-xs text-zinc-500">Discord ID: {row.discordId}</p>
              </div>
            </div>
            <p className="text-lg font-black text-red-300">{row.count} {unit}</p>
          </div>
        );})}
        {rows.length === 0 && <p className="p-5 text-sm text-zinc-400">ยังไม่มีข้อมูลจาก auction_stats.json</p>}
      </div>
    </div>
  );
}
