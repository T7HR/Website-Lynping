export const OWNER_DISCORD_ID = process.env.OWNER_DISCORD_ID || "617690449049681920";
export const SUPABASE_TABLE = process.env.SUPABASE_TABLE_AUCTION_V2 || "auction_products_v2";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL || "#";
export const ENABLE_DEV_LOGIN = process.env.ENABLE_DEV_LOGIN === "true";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}
