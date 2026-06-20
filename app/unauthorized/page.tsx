import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="ไม่มีสิทธิ์เข้าใช้งาน" description="บัญชี Discord นี้ยังไม่ได้รับสิทธิ์สำหรับหน้านี้" />
      <Link className="btn-primary" href="/">กลับหน้าแรก</Link>
    </div>
  );
}
