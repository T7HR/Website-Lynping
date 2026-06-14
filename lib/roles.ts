import { OWNER_DISCORD_ID } from "@/lib/env";
import type { Role, WebSettingsPayload } from "@/lib/types";

const rank: Record<Role, number> = {
  guest: 0,
  user: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

export function getRoleForDiscordId(discordId: string | null | undefined, settings?: WebSettingsPayload): Role {
  if (!discordId) return "guest";
  const id = String(discordId);
  const owner = settings?.owner_id || OWNER_DISCORD_ID;
  if (id === owner) return "owner";
  if (settings?.admins?.[id]?.enabled) return "admin";
  if (settings?.staff?.[id]?.enabled) return "staff";
  return "user";
}

export function hasRole(role: Role, min: Role) {
  return rank[role] >= rank[min];
}
