import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="ประวัติการใช้งาน" description="วิธีใช้งานเว็บและวิธีตรวจสอบประวัติชนะ/ลงประมูล" />
      <div className="grid gap-3 md:grid-cols-2">
        {[
          "กด Login with Discord เพื่อเชื่อมบัญชี",
          "เข้า Profile เพื่อดูจำนวนลงของประมูลและจำนวนชนะประมูล",
          "ดูอันดับรวมที่หน้า Leaderboard",
          "ส่งคำขอลงของได้ที่หน้า Auction Request",
          "Admin/Owner ดูคำขอและรายงานได้ที่ Dashboard",
        ].map((item, index) => (
          <div key={item} className="card p-5">
            <p className="panel-title">Step {index + 1}</p>
            <p className="mt-2 font-semibold text-zinc-200">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
