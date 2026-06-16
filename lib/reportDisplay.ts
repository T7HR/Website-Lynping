import type { LeaderboardRow } from "@/lib/leaderboard";
import type { WebSettingsPayload } from "@/lib/types";

export type DailyReportView = {
  period: string;
  totalRooms: string;
  closedRooms: string;
  totalOpenAmount: string;
  staffReceived: string;
  shopReceived: string;
  topRoomRows: LeaderboardRow[];
  topAmountRows: LeaderboardRow[];
};

export function getEnabledStaffIds(settings: WebSettingsPayload) {
  return Object.values(settings.staff || {})
    .filter(staff => staff.enabled)
    .map(staff => staff.id);
}

export function toStaffMoneyRows(payload: any, staffIds: string[]): LeaderboardRow[] {
  return staffIds
    .map(discordId => ({
      discordId,
      count: extractAmountForStaff(payload, discordId),
    }))
    .sort((a, b) => b.count - a.count);
}

export function toDailyReportView(payload: any): DailyReportView {
  const data = latestReportObject(payload);
  const start = pickValue(data, ["start", "start_time", "from", "from_time", "period_start", "date_from"]);
  const end = pickValue(data, ["end", "end_time", "to", "to_time", "period_end", "date_to"]);

  return {
    period: start || end ? `${formatPlain(start) || "-"} - ${formatPlain(end) || "-"}` : "-",
    totalRooms: formatNumber(pickValue(data, ["total_rooms", "all_rooms", "opened_rooms", "open_rooms", "rooms_total", "rooms", "ลงห้องประมูลทั้งหมด"])),
    closedRooms: formatNumber(pickValue(data, ["closed_rooms", "close_rooms", "closed_total", "ปิดห้องประมูลทั้งหมด"])),
    totalOpenAmount: formatNumber(pickValue(data, ["total_open_amount", "open_total", "opened_amount", "auction_total", "ยอดเปิดประมูลรวม"])),
    staffReceived: formatNumber(pickValue(data, ["staff_received", "staff_total", "employee_received", "staff_income", "ยอดรวมพนักงานได้รับ"])),
    shopReceived: formatNumber(pickValue(data, ["shop_received", "shop_total", "store_received", "shop_income", "ยอดรวมร้านได้รับ"])),
    topRoomRows: extractTopRows(data, ["top_staff_rooms", "top_room_staff", "staff_room_top", "rooms_by_staff", "staff_rooms"]),
    topAmountRows: extractTopRows(data, ["top_staff_amounts", "top_staff_revenue", "staff_amount_top", "staff_sales_top", "revenue_by_staff", "staff_totals"]),
  };
}

function latestReportObject(payload: any): Record<string, any> {
  if (!payload || typeof payload !== "object") return {};
  if (Array.isArray(payload)) {
    return payload
      .filter(item => item && typeof item === "object")
      .sort((a, b) => String(b.created_at || b.date || b.start_time || "").localeCompare(String(a.created_at || a.date || a.start_time || "")))[0] || {};
  }

  const values = Object.values(payload).filter(item => item && typeof item === "object");
  const hasSummaryFields = ["total_rooms", "closed_rooms", "staff_received", "shop_received", "top_staff_rooms"].some(key => key in payload);
  if (hasSummaryFields || values.length === 0) return payload;

  return values.sort((a: any, b: any) => String(b.created_at || b.date || b.start_time || "").localeCompare(String(a.created_at || a.date || a.start_time || "")))[0] as Record<string, any>;
}

function extractAmountForStaff(payload: any, staffId: string): number {
  if (!payload || typeof payload !== "object") return 0;

  if (Array.isArray(payload)) {
    const row = payload.find(item => item && typeof item === "object" && staffIdMatches(item, staffId));
    return extractAmount(row);
  }

  const direct = payload[staffId];
  if (direct !== undefined) return extractAmount(direct);

  for (const value of Object.values(payload)) {
    if (value && typeof value === "object" && staffIdMatches(value, staffId)) {
      return extractAmount(value);
    }
  }

  return 0;
}

function extractTopRows(data: Record<string, any>, keys: string[]): LeaderboardRow[] {
  const value = pickValue(data, keys);
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item, index) => ({
        discordId: pickStaffId(item) || String(index + 1),
        displayName: pickName(item),
        count: extractAmount(item),
      }))
      .filter(row => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([discordId, item]) => ({
        discordId,
        count: extractAmount(item),
      }))
      .filter(row => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  return [];
}

function pickValue(row: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  return undefined;
}

function staffIdMatches(row: any, staffId: string) {
  return pickStaffId(row) === staffId;
}

function pickStaffId(row: any) {
  if (!row || typeof row !== "object") return "";
  const value = pickValue(row, ["staff_id", "discord_id", "discordId", "user_id", "id"]);
  return value ? String(value) : "";
}

function pickName(row: any) {
  if (!row || typeof row !== "object") return undefined;
  const value = pickValue(row, ["name", "display_name", "username", "staff_name"]);
  return value ? String(value) : undefined;
}

function extractAmount(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseNumber(value);
  if (!value || typeof value !== "object") return 0;

  const direct = pickValue(value, ["amount", "total", "balance", "pending", "value", "count", "shop_total", "bonus", "ยอด"]);
  if (direct !== undefined) return extractAmount(direct);

  for (const nested of Object.values(value)) {
    const amount = extractAmount(nested);
    if (amount > 0) return amount;
  }

  return 0;
}

function parseNumber(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export function formatNumber(value: any) {
  const amount = extractAmount(value);
  return amount > 0 ? amount.toLocaleString("en-US") : "-";
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US");
}

function formatPlain(value: any) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}
