import "server-only";
import crypto from "node:crypto";
import { getMirrorPayload, upsertMirrorPayload } from "@/lib/supabaseAdmin";
import { OWNER_DISCORD_ID } from "@/lib/env";
import type { AuctionStatsPayload, WebSettingsPayload, AuditLogEntry } from "@/lib/types";

export const FILES = {
  stats: "auction_stats.json",
  users: "auction_users.json",
  requests: "auction_requests.json",
  results: "auction_results.json",
  archiveCount: "auction_archive_count.json",
  staffShop: "auction_staff_shop.json",
  staffBonus: "auction_staff_bonus.json",
  staffIdle: "auction_staff_idle.json",
  dailyReport: "auction_daily_report.json",
  webSettings: "web_bot_settings.json",
  auditLogs: "web_audit_logs.json",
  sellerEarnings: "web_seller_earnings.json",
  transcripts: "auction_transcripts.json",
};

type SellerEarningsPayload = {
  users: Record<string, {
    total_customer_amount: number;
    closed_count: number;
    updated_at?: string;
  }>;
  processed_results: Record<string, {
    seller_id: string;
    customer_amount: number;
    synced_at: string;
  }>;
  updated_at?: string;
};

export function defaultWebSettings(): WebSettingsPayload {
  return {
    owner_id: OWNER_DISCORD_ID,
    admins: {},
    staff: {},
    staff_manager_ids: [OWNER_DISCORD_ID],
    updated_at: new Date().toISOString(),
  };
}

export async function getAuctionStats() {
  return await getMirrorPayload<AuctionStatsPayload>(FILES.stats, {
    scoreboard_message_id: null,
    sellers: {},
    winners: {},
  });
}

export async function getAuctionRequests() {
  return await getMirrorPayload<Record<string, any>>(FILES.requests, {});
}

export async function saveAuctionRequests(payload: Record<string, any>) {
  await upsertMirrorPayload(FILES.requests, payload);
}

export async function getAuctionResults() {
  return await getMirrorPayload<Record<string, any>>(FILES.results, {});
}

export async function getAuctionTranscripts() {
  return await getMirrorPayload<Record<string, any> | any[]>(FILES.transcripts, {});
}

export async function getAuctionTranscriptById(transcriptId: string) {
  const safeId = String(transcriptId || "").trim();
  if (!/^\d{10,25}$/.test(safeId)) return null;
  return await getMirrorPayload<Record<string, any> | null>(`auction_transcript_${safeId}.json`, null);
}

export async function getSellerEarnings() {
  return normalizeSellerEarnings(await getMirrorPayload<SellerEarningsPayload>(FILES.sellerEarnings, defaultSellerEarnings()));
}

export async function syncSellerEarningsFromResults(results: Record<string, any>) {
  const earnings = await getSellerEarnings();
  let changed = false;

  for (const [key, row] of Object.entries(results || {})) {
    const closed = String(pickValue(row, ["status", "state"]) || pickValue(row?.close_summary, ["status", "state"]) || "").toLowerCase() === "closed";
    if (!closed) continue;

    const resultId = String(pickValue(row, ["id", "auction_id", "channel_id", "message_id"]) || key);
    if (!resultId || earnings.processed_results[resultId]) continue;

    const sellerId = String(
      pickValue(row, ["seller_id", "sellerId", "owner_id", "ownerId"]) ||
      pickValue(row?.close_summary, ["seller_id", "sellerId", "owner_id", "ownerId"]) ||
      "",
    ).trim();
    if (!/^\d{10,25}$/.test(sellerId)) continue;

    const customerAmount = parseAmount(
      pickValue(row, ["customer_amount", "customerAmount"]) ||
      pickValue(row?.close_summary, ["customer_amount", "customerAmount"]) ||
      0,
    );
    if (customerAmount <= 0) continue;

    const user = earnings.users[sellerId] || { total_customer_amount: 0, closed_count: 0 };
    user.total_customer_amount += customerAmount;
    user.closed_count += 1;
    user.updated_at = new Date().toISOString();
    earnings.users[sellerId] = user;
    earnings.processed_results[resultId] = {
      seller_id: sellerId,
      customer_amount: customerAmount,
      synced_at: new Date().toISOString(),
    };
    changed = true;
  }

  if (changed) {
    earnings.updated_at = new Date().toISOString();
    try {
      await upsertMirrorPayload(FILES.sellerEarnings, earnings);
    } catch (error) {
      console.error("Failed to save seller earnings", error);
    }
  }

  return earnings;
}

export async function getStaffShop() {
  return await getMirrorPayload<Record<string, any>>(FILES.staffShop, {});
}

export async function getStaffBonus() {
  return await getMirrorPayload<Record<string, any>>(FILES.staffBonus, {});
}

export async function getDailyReport() {
  return await getMirrorPayload<Record<string, any>>(FILES.dailyReport, {});
}

export async function getWebSettings() {
  const data = await getMirrorPayload<WebSettingsPayload>(FILES.webSettings, defaultWebSettings());
  return normalizeWebSettings(data);
}

export async function saveWebSettings(payload: WebSettingsPayload) {
  const normalized = normalizeWebSettings(payload);
  normalized.updated_at = new Date().toISOString();
  await upsertMirrorPayload(FILES.webSettings, normalized);

  // legacy mirror: main.py มี auction_users.json อยู่ในรายการ sync ด้วย แม้ในโค้ดจะ comment ว่า legacy
  const allowedIds = new Set<string>([
    normalized.owner_id,
    ...Object.values(normalized.admins).filter(x => x.enabled).map(x => x.id),
    ...Object.values(normalized.staff).filter(x => x.enabled).map(x => x.id),
  ]);
  await upsertMirrorPayload(FILES.users, Array.from(allowedIds));
}

export async function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "created_at">) {
  const logs = await getMirrorPayload<AuditLogEntry[]>(FILES.auditLogs, []);
  logs.unshift({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...entry,
  });
  await upsertMirrorPayload(FILES.auditLogs, logs.slice(0, 500));
}

export async function getAuditLogs() {
  return await getMirrorPayload<AuditLogEntry[]>(FILES.auditLogs, []);
}

function defaultSellerEarnings(): SellerEarningsPayload {
  return {
    users: {},
    processed_results: {},
    updated_at: new Date().toISOString(),
  };
}

function normalizeSellerEarnings(input: Partial<SellerEarningsPayload> | null | undefined): SellerEarningsPayload {
  const out = defaultSellerEarnings();
  if (!input || typeof input !== "object") return out;

  for (const [discordId, value] of Object.entries<any>(input.users || {})) {
    if (!/^\d{10,25}$/.test(String(discordId))) continue;
    out.users[String(discordId)] = {
      total_customer_amount: parseAmount(value?.total_customer_amount),
      closed_count: Math.max(0, Number(value?.closed_count || 0)),
      updated_at: value?.updated_at ? String(value.updated_at) : undefined,
    };
  }

  for (const [resultId, value] of Object.entries<any>(input.processed_results || {})) {
    const sellerId = String(value?.seller_id || "");
    if (!resultId || !/^\d{10,25}$/.test(sellerId)) continue;
    out.processed_results[String(resultId)] = {
      seller_id: sellerId,
      customer_amount: parseAmount(value?.customer_amount),
      synced_at: value?.synced_at ? String(value.synced_at) : new Date().toISOString(),
    };
  }

  out.updated_at = input.updated_at ? String(input.updated_at) : out.updated_at;
  return out;
}

function pickValue(row: any, keys: string[]) {
  if (!row || typeof row !== "object") return undefined;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return undefined;
}

function parseAmount(value: any) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const match = String(value ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function normalizeWebSettings(input: Partial<WebSettingsPayload> | null | undefined): WebSettingsPayload {
  const fallback = defaultWebSettings();
  const ownerId = String(input?.owner_id || OWNER_DISCORD_ID);

  const cleanMap = (map: any) => {
    const out: Record<string, any> = {};
    if (!map || typeof map !== "object") return out;
    for (const [id, value] of Object.entries<any>(map)) {
      const cleanId = String(value?.id || id).trim();
      if (!/^\d{10,25}$/.test(cleanId)) continue;
      out[cleanId] = {
        id: cleanId,
        note: String(value?.note || ""),
        enabled: value?.enabled !== false,
        added_by: value?.added_by ? String(value.added_by) : undefined,
        added_at: value?.added_at ? String(value.added_at) : undefined,
        waiting_category_id: value?.waiting_category_id ? String(value.waiting_category_id) : undefined,
      };
    }
    return out;
  };

  return {
    ...fallback,
    ...input,
    owner_id: ownerId,
    admins: cleanMap(input?.admins),
    staff: cleanMap(input?.staff),
    staff_manager_ids: Array.from(new Set([ownerId, ...(input?.staff_manager_ids || []).map(String)])),
  };
}
