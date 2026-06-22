import Link from "next/link";
import { avatarUrl } from "@/lib/session";
import type { DiscordSession, Role } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ControlPanelDrawer, type ControlPanelItem, type ControlPanelSection } from "@/components/ControlPanelDrawer";
import { LogoutButton } from "@/components/LogoutButton";
import { roleLabel } from "@/lib/roleLabels";

const staffItems: ControlPanelItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "DB" },
  { href: "/dashboard/reports", label: "รายงาน", icon: "RP" },
  { href: "/dashboard/requests", label: "คำขอ", icon: "RQ" },
  { href: "/dashboard/auctions", label: "ประมูล", icon: "AC" },
  { href: "/dashboard/transcripts", label: "ประวัติแชท", icon: "TR" },
];

const elevatedStaffItems: ControlPanelItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "DB" },
  { href: "/dashboard/reports", label: "รายงาน", icon: "RP" },
  { href: "/dashboard/transcripts", label: "ประวัติแชท", icon: "TR" },
];

const ownerDevItems: ControlPanelItem[] = [
  { href: "/owner/logs", label: "Logs", icon: "LG" },
  { href: "/owner/system", label: "System", icon: "SY" },
];

const ownerItems: ControlPanelItem[] = [
  { href: "/owner", label: "Owner", icon: "OW" },
  { href: "/owner/admins", label: "Admin", icon: "AD" },
  { href: "/owner/staff", label: "Staff", icon: "ST" },
];

const staffSection: ControlPanelSection = {
  title: "STAFF",
  description: "เมนูพนักงาน",
  items: staffItems,
};

const elevatedStaffSection: ControlPanelSection = {
  title: "STAFF",
  description: "เมนูพนักงาน",
  items: elevatedStaffItems,
};

const ownerDevSection: ControlPanelSection = {
  title: "OWNER.DEV",
  description: "ระบบและบันทึก",
  items: ownerDevItems,
};

const ownerSection: ControlPanelSection = {
  title: "OWNER",
  description: "จัดการสิทธิ์และระบบหลัก",
  items: ownerItems,
};

const sideNavSectionsByRole: Record<Role, ControlPanelSection[]> = {
  guest: [],
  user: [],
  staff: [staffSection],
  admin: [elevatedStaffSection],
  owner_dev: [ownerSection, ownerDevSection, elevatedStaffSection],
  owner: [ownerSection, ownerDevSection, elevatedStaffSection],
};

export function SiteShell({ children, session, role }: { children: React.ReactNode; session: DiscordSession | null; role: Role }) {
  const sideNavSections = sideNavSectionsByRole[role] || [];
  const img = avatarUrl(session, 64);
  const profileHref = session ? "/profile" : "/login";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-red-300/10 bg-zinc-950/86 backdrop-blur-xl">
        <div className="site-header-inner mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" prefetch={true} className="site-brand flex items-center gap-3">
            <img src="/lynping.png?v=1" alt="Lynping Auction" className="site-brand-logo h-12 w-12 rounded-lg border border-red-300/20 object-cover" />
            <div className="site-brand-text min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-red-300/70">Lynping Auction</p>
              <h1 className="truncate font-black text-white">ร้านประมูล Lynping</h1>
            </div>
          </Link>

          <nav className="site-nav flex flex-wrap gap-2">
            <Link href="/" prefetch={true} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white">หน้าหลัก</Link>
            <Link href="/leaderboard" prefetch={true} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white">อันดับ</Link>
            <Link href={profileHref} prefetch={true} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white">โปรไฟล์</Link>
            {sideNavSections.length > 0 && <ControlPanelDrawer sections={sideNavSections} role={role} />}
          </nav>

          <div className="site-user-actions flex items-center gap-3">
            {session ? (
              <>
                <div className="site-user-identity flex min-w-0 items-center gap-3">
                  {img ? <img src={img} alt="avatar" className="site-user-avatar h-9 w-9 rounded-lg object-cover" /> : <div className="site-user-avatar h-9 w-9 rounded-lg bg-zinc-800" />}
                  <div className="site-user-meta min-w-0">
                    <p className="truncate text-sm font-semibold">{session.global_name || session.username}</p>
                    <p className="truncate text-xs font-bold text-red-300">{roleLabel(role)}</p>
                  </div>
                </div>
                <div className="site-user-controls flex items-center gap-3">
                  <ThemeToggle />
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link className="btn-primary py-2" href="/login" prefetch={true}>Login Discord</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="site-main-wrap mx-auto max-w-7xl px-4 py-8">
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <footer className="site-footer mx-auto max-w-7xl border-t border-white/10 px-4 py-10 text-sm text-zinc-500">© Lynping Auction — connected with Nextcord + Supabase JSON mirror</footer>
    </div>
  );
}
