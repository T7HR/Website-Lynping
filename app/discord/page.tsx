import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DISCORD_INVITE_URL } from "@/lib/env";

export default function DiscordPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Discord Server" description="ข้อมูลเซิร์ฟเวอร์ ลิงก์เชิญ และช่องแนะนำ" actions={<a className="btn-primary" href={DISCORD_INVITE_URL} target="_blank">Join Discord</a>} />
      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard title="ห้องประมูล" text="ติดตามตู้ประมูลและกติกาการบิด" />
        <InfoCard title="ห้องแจ้งปัญหา" text="ติดต่อ Staff เมื่อพบปัญหา" />
        <InfoCard title="Scoreboard" text="ดูอันดับได้ทั้งใน Discord และบนเว็บ" />
      </div>
      <Link className="btn-ghost" href="/leaderboard">ดูอันดับบนเว็บ</Link>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-5">
      <p className="panel-title">Discord</p>
      <h2 className="mt-1 font-black">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{text}</p>
    </div>
  );
}
