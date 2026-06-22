import "server-only";

const DISCORD_API = "https://discord.com/api/v10";
const DEFAULT_TIMEOUT_MS = 3500;
const ROLE_CACHE_TTL_MS = Number(process.env.DISCORD_ROLE_CACHE_TTL_MS ?? "5000");

export const DISCORD_ROLE_IDS = {
  admin: process.env.DISCORD_ADMIN_ROLE_ID || "1443210704332263440",
  staff: process.env.DISCORD_STAFF_ROLE_ID || "1450058093290590218",
  ownerDev: process.env.DISCORD_OWNER_DEV_ROLE_ID || "1450057724502081607",
  owner: process.env.DISCORD_OWNER_ROLE_ID || "1443210704332263441",
};

type DiscordGuildMemberWithRoles = {
  roles?: string[];
};

type CachedGuildRoles = {
  expiresAt: number;
  roles: string[];
};

const roleCache = new Map<string, CachedGuildRoles>();
const inFlightRoleFetches = new Map<string, Promise<string[]>>();

export async function getDiscordGuildRoleIds(discordId: string | null | undefined): Promise<string[]> {
  if (!discordId) return [];

  const id = String(discordId);
  const now = Date.now();
  const cached = roleCache.get(id);
  if (ROLE_CACHE_TTL_MS > 0 && cached && cached.expiresAt > now) return cached.roles;

  // กันการยิง Discord API ซ้ำพร้อมกันหลายครั้งในช่วงรีเฟรชหน้าเดียวกัน
  // ถ้าตั้ง DISCORD_ROLE_CACHE_TTL_MS=0 จะไม่เก็บ cache ข้าม request/refresh
  const inFlight = inFlightRoleFetches.get(id);
  if (inFlight) return inFlight;

  const fetchPromise = fetchDiscordGuildRoleIds(id)
    .then((roles) => {
      if (ROLE_CACHE_TTL_MS > 0) {
        roleCache.set(id, {
          expiresAt: Date.now() + ROLE_CACHE_TTL_MS,
          roles,
        });
      } else {
        roleCache.delete(id);
      }
      return roles;
    })
    .finally(() => {
      inFlightRoleFetches.delete(id);
    });

  inFlightRoleFetches.set(id, fetchPromise);
  return fetchPromise;
}

export function clearDiscordGuildRoleCache(discordId?: string | null) {
  if (discordId) {
    const id = String(discordId);
    roleCache.delete(id);
    inFlightRoleFetches.delete(id);
  } else {
    roleCache.clear();
    inFlightRoleFetches.clear();
  }
}

async function fetchDiscordGuildRoleIds(discordId: string): Promise<string[]> {
  const token = process.env.DISCORD_BOT_TOKEN?.replace(/^Bot\s+/i, "").trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  if (!token || !guildId) return [];

  try {
    const res = await fetchWithTimeout(`${DISCORD_API}/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const member = await res.json() as DiscordGuildMemberWithRoles;
    return Array.isArray(member.roles) ? member.roles.map(String) : [];
  } catch {
    return [];
  }
}

async function fetchWithTimeout(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
