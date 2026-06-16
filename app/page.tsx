import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getAuctionRequests, getAuctionResults, getAuctionStats } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { toLeaderboardRows } from "@/lib/leaderboard";
import { DISCORD_INVITE_URL } from "@/lib/env";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const [stats, requests, results, session] = await Promise.all([getAuctionStats(), getAuctionRequests(), getAuctionResults(), getSession()]);
  const rawSellers = toLeaderboardRows(stats, "sellers");
  const rawWinners = toLeaderboardRows(stats, "winners");
  const [sellers, winners] = await Promise.all([
    withDiscordProfiles(rawSellers),
    withDiscordProfiles(rawWinners),
  ]);
  const pending = Object.values<any>(requests).filter(x => x.status === "pending").length;

  return (
    <div className="space-y-10">
      <section className="overflow-hidden border-b border-white/10 pb-8">
        <PageHeader
          eyebrow="Welcome to Lynping Auction"
          title="Lynping Auction"
          description="ร้านประมูลที่ดีที่สุดในตอนนี้ เชื่อมต่อกับ Discord เพื่อประสบการณ์ที่ดีที่สุด"
          actions={
            <>
              {!session && <Link href="/login" className="btn-primary">Login with Discord</Link>}
              <a href={DISCORD_INVITE_URL} className="btn-ghost" target="_blank">Join Discord</a>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="ผู้ลงของทั้งหมด" value={sellers.length} />
          <StatCard label="ผู้ชนะทั้งหมด" value={winners.length} />
          <StatCard label="คำขอ Pending" value={pending} />
          <StatCard label="เคสที่มีข้อมูล" value={Object.keys(results).length} />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["ว่าง", "รอใส่คำอธิบาย", "/auction/request"],
          ["ว่าง", "รอใส่คำอธิบาย", "/history"],
          ["ว่าง", "รอใส่คำอธิบาย", "/rules"],
          ["ว่าง", "รอใส่คำอธิบาย", "/discord"],
        ].map(([title, text, href]) => (
          <Link key={href} href={href} className="card p-5 hover:border-red-400/30 hover:bg-red-500/5">
            <p className="panel-title">Workflow</p>
            <h2 className="mt-1 text-xl font-black">{title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{text}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable title="Top ลงของประมูล" rows={sellers} unit="ครั้ง" />
        <LeaderboardTable title="Top ชนะประมูล" rows={winners} unit="ครั้ง" />
      </section>
    </div>
  );
}
