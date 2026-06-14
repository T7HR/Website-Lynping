import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="ส่งคำขอสำเร็จ" description="ระบบได้รับคำขอแล้ว รอ Admin ตรวจสอบ" />
      <Link className="btn-primary" href="/auction/request/history">ดูประวัติคำขอ</Link>
    </div>
  );
}
