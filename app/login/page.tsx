import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ENABLE_DEV_LOGIN } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="เข้าสู่ระบบด้วย Discord" description="ระบบจะใช้ Discord OAuth2 เพื่อดึง Discord ID แล้วเอาไปเทียบ Role ใน web_bot_settings.json" />
      <div className="card space-y-4 p-6">
        <Link href="/api/auth/discord" className="btn-primary w-full">Login with Discord</Link>
        {ENABLE_DEV_LOGIN && (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            <p className="font-bold">DEV LOGIN เปิดอยู่</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="btn-ghost py-2" href="/api/dev-login?role=owner">Owner</Link>
              <Link className="btn-ghost py-2" href="/api/dev-login?role=admin">Admin</Link>
              <Link className="btn-ghost py-2" href="/api/dev-login?role=staff">Staff</Link>
              <Link className="btn-ghost py-2" href="/api/dev-login?role=user">User</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
