import "server-only";
import type { LeaderboardRow } from "@/lib/leaderboard";

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

const DISCORD_API = "https://discord.com/api/v10";

export async function withDiscordProfiles(rows: LeaderboardRow[], limit = 10): Promise<LeaderboardRow[]> {
  const visibleRows = rows.slice(0, limit);
  const profiles = await getDiscordProfiles(visibleRows.map(row => row.discordId));

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

  if (!token || !guildId || uniqueIds.length === 0) {
    for (const id of uniqueIds) {
      profiles.set(id, {
        displayName: id,
        avatarUrl: defaultAvatarUrl(id),
      });
    }
    return profiles;
  }

  await Promise.all(uniqueIds.map(async id => {
    const profile = await fetchDiscordGuildMemberProfile(guildId, token, id);
    profiles.set(id, profile || {
      displayName: id,
      avatarUrl: defaultAvatarUrl(id),
    });
  }));

  return profiles;
}

async function fetchDiscordGuildMemberProfile(guildId: string, token: string, discordId: string): Promise<DiscordProfile | null> {
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const member = await res.json() as DiscordGuildMember;
    const user = member.user || {};
    const displayName = member.nick || user.global_name || user.username || discordId;
    const avatarUrl = member.avatar
      ? guildAvatarUrl(guildId, discordId, member.avatar)
      : user.avatar
        ? userAvatarUrl(discordId, user.avatar)
        : defaultAvatarUrl(discordId);

    return { displayName, avatarUrl };
  } catch {
    return null;
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
