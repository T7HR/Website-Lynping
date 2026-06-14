import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getSession } from "@/lib/session";
import { getWebSettings } from "@/lib/auctionStore";
import { getRoleForDiscordId } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Discord Auction Server",
  description: "เว็บไซต์ร้านประมูล Discord ที่เชื่อมกับบอท Nextcord และ Supabase table เดียวกัน",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const settings = await getWebSettings();
  const role = session?.id ? getRoleForDiscordId(session.id, settings) : "guest";

  return (
    <html lang="th">
      <body>
        <SiteShell session={session} role={role}>{children}</SiteShell>
      </body>
    </html>
  );
}
