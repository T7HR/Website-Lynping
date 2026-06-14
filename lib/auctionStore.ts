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
