import { OWNER_DISCORD_ID } from "@/lib/env";
import { DISCORD_ROLE_IDS, getDiscordGuildRoleIds } from "@/lib/discordGuildRoles";
import type { Role, WebSettingsPayload } from "@/lib/types";

const rank: Record<Role, number> = {
  guest: 0,
  user: 1,
  staff: 2,
  admin: 3,
  owner: 4,
  owner_dev: 4,
};

export async function getRoleForDiscordId(discordId: string | null | undefined, settings?: WebSettingsPayload): Promise<Role> {
  if (!discordId) return "guest";

  const id = String(discordId);
  const owner = settings?.owner_id || OWNER_DISCORD_ID;

  if (id === owner) return "owner";

  const discordRoleIds = await getDiscordGuildRoleIds(id);
  const roleSet = new Set(discordRoleIds.map(String));

  if (roleSet.has(DISCORD_ROLE_IDS.owner)) return "owner";
  if (roleSet.has(DISCORD_ROLE_IDS.ownerDev)) return "owner_dev";
  if (roleSet.has(DISCORD_ROLE_IDS.admin)) return "admin";
  if (roleSet.has(DISCORD_ROLE_IDS.staff)) return "staff";

  if (settings?.admins?.[id]?.enabled) return "admin";
  if (settings?.staff?.[id]?.enabled) return "staff";

  return "user";
}

export function hasRole(role: Role, min: Role) {
  return rank[role] >= rank[min];
}
