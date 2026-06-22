import "server-only";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { getMirrorPayload, upsertMirrorPayload } from "@/lib/supabaseAdmin";

type DiscordGuildMember = {
  nick?: string | null;
  avatar?: string | null;
  user?: {
    id?: string;
    username?: string;
    global_name?: string | null;
    avatar?: string | null;
  };
};

type DiscordProfile = {
  displayName: string;
  avatarUrl: string;
};

type ProfileMirrorPayload = {
  profiles: Record<string, {
    display_name?: string;
    avatar_url?: string;
    updated_at?: string;
  }>;
  updated_at?: string;
};

const DISCORD_API = "https://discord.com/api/v10";
const PROFILE_MIRROR_FILE = "web_discord_profiles.json";
const PROFILE_CACHE_TTL_MS = 10 * 60 * 1000;
const PROFILE_MIRROR_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PROFILE_LOOKUP_CONCURRENCY = 8;
const PROFILE_FETCH_TIMEOUT_MS = 3500;

const profileCache = new Map<string, {
  expiresAt: number;
  profile: DiscordProfile;
}>();

export async function withDiscordProfiles(rows: LeaderboardRow[], limit: number | null = 10): Promise<LeaderboardRow[]> {
  const lookupRows = limit === null ? rows : rows.slice(0, Math.max(0, limit));
  const profiles = await getDiscordProfiles(lookupRows.map(row => row.discordId));

  return rows.map(row => {
    const profile = profiles.get(row.discordId);
    if (!profile) return row;
    return {
      ...row,
      displayName: row.displayName || profile.displayName,
      avatarUrl: row.avatarUrl || profile.avatarUrl,
    };
  });
}

async function getDiscordProfiles(discordIds: string[]) {
  const token = process.env.DISCORD_BOT_TOKEN?.replace(/^Bot\s+/i, "").trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const uniqueIds = Array.from(new Set(discordIds.filter(Boolean)));
  const profiles = new Map<string, DiscordProfile>();
  const missingIds: string[] = [];
  const staleIds: string[] = [];
  const now = Date.now();

  for (const id of uniqueIds) {
    const cached = profileCache.get(id);
    if (cached && cached.expiresAt > now) {
      profiles.set(id, cached.profile);
      continue;
    }
    missingIds.push(id);
  }

  const mirror = await getProfileMirror();
  for (let index = missingIds.length - 1; index >= 0; index -= 1) {
    const id = missingIds[index];
    const cached = profileFromMirror(id, mirror, now);
    if (!cached) continue;

    profiles.set(id, cached.profile);
    profileCache.set(id, {
      expiresAt: now + PROFILE_CACHE_TTL_MS,
      profile: cached.profile,
    });
    missingIds.splice(index, 1);
    if (cached.isStale) staleIds.push(id);
  }

  if (!token || !guildId || uniqueIds.length === 0) {
    for (const id of missingIds) {
      const fallback = {
        displayName: id,
        avatarUrl: defaultAvatarUrl(id),
      };
      profiles.set(id, fallback);
      profileCache.set(id, {
        expiresAt: now + PROFILE_CACHE_TTL_MS,
        profile: fallback,
      });
    }
    return profiles;
  }

  const idsToRefresh = Array.from(new Set([...missingIds, ...staleIds]));
  const fetchedProfiles = await fetchDiscordProfiles(guildId, token, idsToRefresh);

  for (const id of idsToRefresh) {
    const profile = fetchedProfiles.get(id);
    if (profile) {
      profiles.set(id, profile);
      profileCache.set(id, {
        expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
        profile,
      });
      continue;
    }

    if (!profiles.has(id)) {
      const fallback = {
        displayName: id,
        avatarUrl: defaultAvatarUrl(id),
      };
      profiles.set(id, fallback);
      profileCache.set(id, {
        expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
        profile: fallback,
      });
    }
  }

  if (fetchedProfiles.size > 0) {
    await saveProfilesToMirror(fetchedProfiles);
  }

  return profiles;
}

async function fetchDiscordProfiles(guildId: string, token: string, discordIds: string[]) {
  const uniqueIds = Array.from(new Set(discordIds.filter(Boolean)));
  const profiles = await fetchDiscordGuildMemberProfileMap(guildId, token, uniqueIds);
  const missingIds = uniqueIds.filter(id => !profiles.has(id));

  for (let index = 0; index < missingIds.length; index += PROFILE_LOOKUP_CONCURRENCY) {
    const chunk = missingIds.slice(index, index + PROFILE_LOOKUP_CONCURRENCY);
    const resolved = await Promise.all(chunk.map(async id => {
      const profile = await fetchDiscordGuildMemberProfile(guildId, token, id);
      return [id, profile] as const;
    }));

    for (const [id, profile] of resolved) {
      if (profile) profiles.set(id, profile);
    }
  }

  return profiles;
}

async function fetchDiscordGuildMemberProfileMap(guildId: string, token: string, discordIds: string[]) {
  const wantedIds = new Set(discordIds);
  const profiles = new Map<string, DiscordProfile>();
  if (wantedIds.size === 0) return profiles;

  let after = "0";
  const maxPages = 10;
  for (let page = 0; page < maxPages && wantedIds.size > 0; page += 1) {
    try {
      const params = new URLSearchParams({ limit: "1000", after });
      const res = await fetchWithTimeout(`${DISCORD_API}/guilds/${guildId}/members?${params}`, {
        headers: { Authorization: `Bot ${token}` },
        next: { revalidate: 300 },
      });
      if (!res.ok) break;

      const members = await res.json() as DiscordGuildMember[];
      if (!Array.isArray(members) || members.length === 0) break;

      for (const member of members) {
        const userId = member.user?.id;
        if (!userId || !wantedIds.has(userId)) continue;

        const profile = profileFromGuildMember(guildId, userId, member);
        profiles.set(userId, profile);
        wantedIds.delete(userId);
      }

      const lastUserId = members[members.length - 1]?.user?.id;
      if (!lastUserId || lastUserId === after) break;
      after = lastUserId;
    } catch {
      break;
    }
  }

  return profiles;
}

async function fetchDiscordGuildMemberProfile(guildId: string, token: string, discordId: string): Promise<DiscordProfile | null> {
  try {
    const res = await fetchWithTimeout(`${DISCORD_API}/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const member = await res.json() as DiscordGuildMember;
    return profileFromGuildMember(guildId, discordId, member);
  } catch {
    return null;
  }
}

function profileFromGuildMember(guildId: string, discordId: string, member: DiscordGuildMember): DiscordProfile {
  const user = member.user || {};
  const displayName = member.nick || user.global_name || user.username || discordId;
  const avatarUrl = member.avatar
    ? guildAvatarUrl(guildId, discordId, member.avatar)
    : user.avatar
      ? userAvatarUrl(discordId, user.avatar)
      : defaultAvatarUrl(discordId);

  return { displayName, avatarUrl };
}

async function getProfileMirror(): Promise<ProfileMirrorPayload> {
  return await getMirrorPayload<ProfileMirrorPayload>(PROFILE_MIRROR_FILE, {
    profiles: {},
  });
}

function profileFromMirror(id: string, mirror: ProfileMirrorPayload, now: number) {
  const row = mirror.profiles?.[id];
  if (!row?.display_name || !row?.avatar_url) return null;

  const updatedAt = row.updated_at ? Date.parse(row.updated_at) : 0;
  return {
    isStale: !updatedAt || now - updatedAt > PROFILE_MIRROR_TTL_MS,
    profile: {
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    },
  };
}

async function saveProfilesToMirror(profiles: Map<string, DiscordProfile>) {
  try {
    const mirror = await getProfileMirror();
    const nowIso = new Date().toISOString();
    const nextProfiles = { ...(mirror.profiles || {}) };

    for (const [id, profile] of profiles.entries()) {
      nextProfiles[id] = {
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        updated_at: nowIso,
      };
    }

    await upsertMirrorPayload(PROFILE_MIRROR_FILE, {
      ...mirror,
      profiles: nextProfiles,
      updated_at: nowIso,
    });
  } catch {
    // Profile cache is an optimization; leaderboard data still renders without it.
  }
}

async function fetchWithTimeout(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function guildAvatarUrl(guildId: string, userId: string, avatarHash: string) {
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${avatarHash}.${ext}?size=128`;
}

function userAvatarUrl(userId: string, avatarHash: string) {
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
}

function defaultAvatarUrl(userId: string) {
  let index = 0;
  try {
    index = Number((BigInt(userId) >> BigInt(22)) % BigInt(6));
  } catch {
    index = 0;
  }
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
