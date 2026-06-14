import Link from "next/link";
import { avatarUrl } from "@/lib/session";
import type { DiscordSession, Role } from "@/lib/types";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  guest: [
    { href: "/", label: "หน้าแรก" },
    { href: "/leaderboard", label: "อันดับ" },
    { href: "/rules", label: "กฎ" },
    { href: "/history", label: "วิธีใช้" },
    { href: "/discord", label: "Discord" },
  ],
  user: [
    { href: "/", label: "หน้าแรก" },
    { href: "/profile", label: "โปรไฟล์" },
    { href: "/profile/stats", label: "สถิติ" },
    { href: "/my-auctions", label: "ที่ฉันลง" },
    { href: "/my-wins", label: "ที่ฉันชนะ" },
    { href: "/auction/request", label: "ส่งคำขอ" },
    { href: "/leaderboard", label: "อันดับ" },
  ],
  staff: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/requests", label: "คำขอ" },
    { href: "/dashboard/auctions", label: "ประมูล" },
    { href: "/profile", label: "โปรไฟล์" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/requests", label: "คำขอ" },
    { href: "/dashboard/auctions", label: "ประมูล" },
    { href: "/dashboard/reports", label: "รายงาน" },
    { href: "/leaderboard", label: "อันดับ" },
  ],
  owner: [
    { href: "/owner", label: "Owner" },
    { href: "/owner/admins", label: "Admin" },
    { href: "/owner/staff", label: "Staff" },
    { href: "/owner/logs", label: "Logs" },
    { href: "/owner/system", label: "System" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/leaderboard", label: "อันดับ" },
  ],
};

export function SiteShell({ children, session, role }: { children: React.ReactNode; session: DiscordSession | null; role: Role }) {
  const nav = navByRole[role] || navByRole.guest;
  const img = avatarUrl(session, 64);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 font-black">A</div>
            <div>
              <p className="text-sm text-zinc-400">Discord Auction</p>
              <h1 className="font-bold">Server Website</h1>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-2">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                {img ? <img src={img} alt="avatar" className="h-9 w-9 rounded-full" /> : <div className="h-9 w-9 rounded-full bg-zinc-800" />}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{session.global_name || session.username}</p>
                  <p className="text-xs text-indigo-300">{role.toUpperCase()}</p>
                </div>
                <Link className="btn-ghost py-2" href="/api/auth/logout">ออก</Link>
              </>
            ) : (
              <Link className="btn-primary py-2" href="/login">Login Discord</Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-10 text-sm text-zinc-500">© Discord Auction Website — connected with Nextcord + Supabase JSON mirror</footer>
    </div>
  );
}
