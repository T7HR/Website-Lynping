import type { DailyReportView } from "@/lib/reportDisplay";
import { formatMoney } from "@/lib/reportDisplay";
import type { LeaderboardRow } from "@/lib/leaderboard";

export function DailyReportCard({ report }: { report: DailyReportView }) {
  return (
    <section className="card p-5">
      <p className="panel-title">Daily Report</p>
      <h2 className="mt-1 text-xl font-black">สรุปประมูลประจำวัน</h2>
      <p className="mt-3 text-sm font-semibold text-zinc-300">รอบเวลา</p>
      <p className="mt-1 text-sm text-zinc-400">{report.period}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ReportMetric label="ลงห้องประมูลทั้งหมด" value={report.totalRooms} />
        <ReportMetric label="ปิดห้องประมูลทั้งหมด" value={report.closedRooms} />
        <ReportMetric label="ยอดปิดประมูลรวม" value={report.totalOpenAmount} />
        <ReportMetric label="ยอดรวมพนักงานได้รับ" value={report.staffReceived} />
        <ReportMetric label="ยอดรวมร้านได้รับ" value={report.shopReceived} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <TopRows title="Top 3 พนักงานที่ลงห้องประมูลเยอะที่สุดวันนี้" rows={report.topRoomRows} unit="ห้อง" />
        <TopRows title="Top 3 พนักงานที่ได้รับยอดรวมสูงที่สุดวันนี้" rows={report.topAmountRows} unit="" />
      </div>
    </section>
  );
}

export function StaffMoneyCard({ title, rows, emptyText }: { title: string; rows: LeaderboardRow[]; emptyText: string }) {
  return (
    <section className="card p-5">
      <p className="panel-title">Staff Balance</p>
      <h2 className="mt-1 text-xl font-black">{title}</h2>
      <div className="mt-4 divide-y divide-white/10">
        {rows.map(row => (
          <div key={row.discordId} className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={row.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt={row.displayName || row.discordId}
                className="h-11 w-11 shrink-0 rounded-lg border border-white/10 bg-white/10 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{row.displayName || row.discordId}</p>
                <p className="text-xs text-zinc-500">Discord ID: {row.discordId}</p>
              </div>
            </div>
            <p className="shrink-0 text-lg font-black text-red-300">{formatMoney(row.count)}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="py-3 text-sm text-zinc-400">{emptyText}</p>}
      </div>
    </section>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold text-zinc-300">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function TopRows({ title, rows, unit }: { title: string; rows: LeaderboardRow[]; unit: string }) {
  return (
    <div>
      <h3 className="font-black text-zinc-100">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.discordId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-sm">
            <span className="min-w-0 truncate">
              #{index + 1} {row.displayName || row.discordId}
            </span>
            <b className="shrink-0">{formatMoney(row.count)} {unit}</b>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-zinc-500">ยังไม่มีข้อมูล Top Staff จาก daily report</p>}
      </div>
    </div>
  );
}
