import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getAuctionArchiveCount, getAuctionRequests, getAuctionStats } from "@/lib/auctionStore";
import { withDiscordProfiles } from "@/lib/discordProfiles";
import { toLeaderboardRows } from "@/lib/leaderboard";
import { DISCORD_INVITE_URL } from "@/lib/env";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const [stats, requests, archiveCount, session] = await Promise.all([
    getAuctionStats(),
    getAuctionRequests(),
    getAuctionArchiveCount(),
    getSession(),
  ]);
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
          <StatCard label="ปิดตู้ประมูลไปแล้ว" value={archiveCount} />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { title: "กฏร้านประมูล", text: "อ่านกฏภายในร้านประมูล", href: "https://sites.google.com/view/lynping-shop/กฏภายในราน?authuser=0", external: true },
          { title: "ว่าง", text: "รอใส่คำอธิบาย", href: "/history" },
          { title: "ว่าง", text: "รอใส่คำอธิบาย", href: "/rules" },
          { title: "ว่าง", text: "รอใส่คำอธิบาย", href: "/discord" },
        ].map(({ title, text, href, external }) => {
          const className = "card p-5 hover:border-red-400/30 hover:bg-red-500/5";
          const content = (
            <>
              <p className="panel-title">Workflow</p>
              <h2 className="mt-1 text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{text}</p>
            </>
          );

          return external ? (
            <a key={href} href={href} className={className} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <Link key={href} href={href} className={className}>
              {content}
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable title="Top ลงของประมูล" rows={sellers} unit="ครั้ง" />
        <LeaderboardTable title="Top ชนะประมูล" rows={winners} unit="ครั้ง" />
      </section>
    </div>
  );
}
