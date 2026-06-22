import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const errorMessages: Record<string, string> = {
  missing_discord_env: "ยังไม่ได้ตั้งค่า DISCORD_CLIENT_ID หรือ DISCORD_CLIENT_SECRET ใน .env.local",
  oauth_state: "เซสชัน Discord หมดอายุหรือไม่ตรงกัน กรุณาลองเข้าสู่ระบบใหม่",
  discord: "Discord OAuth ไม่สำเร็จ กรุณาตรวจ Client ID, Client Secret และ Redirect URL",
};

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const error = (await searchParams)?.error;
  const errorMessage = error ? errorMessages[error] || "เข้าสู่ระบบไม่สำเร็จ" : null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="เข้าสู่ระบบด้วย Discord" description="เข้าสู่ระบบด้วย Discord คุณจะสามารถดูข้อมูลภายในเซิร์ฟเวอร์ของร้านได้" />
      <div className="card space-y-4 p-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            {errorMessage}
          </div>
        )}
        <Link href="/api/auth/discord" className="btn-primary w-full">Login with Discord</Link>
      </div>
    </div>
  );
}
