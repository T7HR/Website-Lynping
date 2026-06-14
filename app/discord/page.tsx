import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DISCORD_INVITE_URL } from "@/lib/env";

export default function DiscordPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Discord Server" description="ข้อมูลเซิร์ฟเวอร์ ลิงก์เชิญ และช่องแนะนำ" actions={<a className="btn-primary" href={DISCORD_INVITE_URL} target="_blank">Join Discord</a>} />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card p-5"><h2 className="font-bold">ห้องประมูล</h2><p className="mt-2 text-sm text-zinc-400">ติดตามตู้ประมูลและกติกาการบิด</p></div>
        <div className="card p-5"><h2 className="font-bold">ห้องแจ้งปัญหา</h2><p className="mt-2 text-sm text-zinc-400">ติดต่อ Staff เมื่อพบปัญหา</p></div>
        <div className="card p-5"><h2 className="font-bold">Scoreboard</h2><p className="mt-2 text-sm text-zinc-400">ดูอันดับได้ทั้งใน Discord และบนเว็บ</p></div>
      </div>
      <Link className="btn-ghost" href="/leaderboard">ดูอันดับบนเว็บ</Link>
    </div>
  );
}
