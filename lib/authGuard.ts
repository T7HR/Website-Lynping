import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWebSettings } from "@/lib/auctionStore";
import { getRoleForDiscordId, hasRole } from "@/lib/roles";
import type { Role } from "@/lib/types";

export async function requireUser(minRole: Role = "user") {
  const session = await getSession();
  if (!session) redirect("/login");

  const settings = await getWebSettings();
  const role = getRoleForDiscordId(session.id, settings);

  if (!hasRole(role, minRole)) redirect("/unauthorized");
  return { session, role, settings };
}
