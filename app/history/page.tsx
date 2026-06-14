import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="ประวัติการใช้งาน" description="วิธีใช้งานเว็บและวิธีตรวจสอบประวัติชนะ/ลงประมูล" />
      <div className="card p-6 text-zinc-300">
        <ol className="list-decimal space-y-3 pl-5">
          <li>กด Login with Discord เพื่อเชื่อมบัญชี</li>
          <li>เข้า Profile เพื่อดูจำนวนลงของประมูลและจำนวนชนะประมูล</li>
          <li>ดูอันดับรวมที่หน้า Leaderboard</li>
          <li>ส่งคำขอลงของได้ที่หน้า Auction Request</li>
          <li>Admin/Owner ดูคำขอและรายงานได้ที่ Dashboard</li>
        </ol>
      </div>
    </div>
  );
}
