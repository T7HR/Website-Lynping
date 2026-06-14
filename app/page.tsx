import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getAuctionRequests, getAuctionResults, getAuctionStats } from "@/lib/auctionStore";
import { toLeaderboardRows } from "@/lib/leaderboard";
import { DISCORD_INVITE_URL } from "@/lib/env";

export default async function HomePage() {
  const [stats, requests, results] = await Promise.all([getAuctionStats(), getAuctionRequests(), getAuctionResults()]);
  const sellers = toLeaderboardRows(stats, "sellers");
  const winners = toLeaderboardRows(stats, "winners");
  const pending = Object.values<any>(requests).filter(x => x.status === "pending").length;

  return (
    <div className="space-y-10">
      <section className="card overflow-hidden p-8 md:p-12">
        <PageHeader
          eyebrow="NEXTCORD + SUPABASE + VERCEL"
          title="เว็บไซต์ร้านประมูล Discord"
          description="เว็บนี้อ่าน scoreboard และข้อมูลผู้ใช้จาก Supabase table เดียวกับ main.py: auction_products_v2 โดยอ้างอิงไฟล์ JSON mirror ของบอท เช่น auction_stats.json และ auction_requests.json"
          actions={
            <>
              <Link href="/login" className="btn-primary">Login with Discord</Link>
              <a href={DISCORD_INVITE_URL} className="btn-ghost" target="_blank">Join Discord</a>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="ผู้ลงของทั้งหมด" value={sellers.length} hint="จาก auction_stats.json / sellers" />
          <StatCard label="ผู้ชนะทั้งหมด" value={winners.length} hint="จาก auction_stats.json / winners" />
          <StatCard label="คำขอ Pending" value={pending} hint="จาก auction_requests.json" />
          <StatCard label="เคสที่มีข้อมูล" value={Object.keys(results).length} hint="จาก auction_results.json" />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          ["สมัครโหมด", "ส่งคำขอลงของประมูลผ่านเว็บ", "/auction/request"],
          ["ประวัติการใช้งาน", "ดูวิธีเชื่อม Discord และวิธีลงประมูล", "/history"],
          ["ข้อตกลงและกติกา", "กฎการบิด ห้ามลบบิด Blacklist", "/rules"],
          ["หาเพื่อนลงห้อง", "ข้อมูล Discord server และช่องแนะนำ", "/discord"],
        ].map(([title, text, href]) => (
          <Link key={href} href={href} className="card p-5 hover:bg-white/[0.08]">
            <h2 className="text-xl font-bold">{title}</h2>
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
