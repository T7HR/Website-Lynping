import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getSession } from "@/lib/session";
import { getWebSettings } from "@/lib/auctionStore";
import { getRoleForDiscordId } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Lynping Auction",
  description: "ร้านประมูล Lynping Auction ร้านประมูลที่ดีที่สุดในตอนนี้!!",
  icons: {
    icon: "/lynping.nobg.png",
    shortcut: "/lynping.nobg.png",
    apple: "/lynping.nobg.png",
  },  
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const settings = await getWebSettings();
  const role = session?.id ? await getRoleForDiscordId(session.id, settings) : "guest";

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var theme = localStorage.getItem("lynping-theme");
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.dataset.theme = theme;
} catch (_) {
  document.documentElement.dataset.theme = "dark";
}
            `,
          }}
        />
      </head>
      <body>
        <SiteShell session={session} role={role}>{children}</SiteShell>
      </body>
    </html>
  );
}
