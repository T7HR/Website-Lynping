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
  const uniqueStaffIds = Array.from(new Set(staffIds.map(id => String(id || "").trim()).filter(Boolean)));
  return uniqueStaffIds
    .map(discordId => ({
      discordId,
      count: extractAmountForStaff(payload, discordId),
    }))
    .sort((a, b) => b.count - a.count);
}

export function toDailyReportView(payload: any): DailyReportView {
  // auction_daily_report.json ของบอทจะเก็บข้อมูลวันที่ตัดรอบล่าสุดไว้ที่ lastday
  // เว็บจึงต้องอ่าน lastday เป็นหลัก และ fallback ไป current สำหรับไฟล์เก่าที่ยังไม่มี lastday
  const data = latestReportObject(payload);
  const start = pickValue(data, ["start", "start_time", "from", "from_time", "period_start", "date_from"]);
  const end = pickValue(data, ["end", "end_time", "to", "to_time", "period_end", "date_to"]);

  return {
    period: start || end ? `${formatDateText(start) || "-"} - ${formatDateText(end) || "-"}` : "-",
    totalRooms: formatNumber(pickValue(data, ["opened_count", "total_rooms", "all_rooms", "opened_rooms", "open_rooms", "rooms_total", "rooms", "ลงห้องประมูลทั้งหมด"])),
    closedRooms: formatNumber(pickValue(data, ["closed_count", "closed_rooms", "close_rooms", "closed_total", "ปิดห้องประมูลทั้งหมด"])),
    totalOpenAmount: formatNumber(pickValue(data, ["total_final_price", "total_open_amount", "open_total", "opened_amount", "auction_total", "ยอดเปิดประมูลรวม", "ยอดปิดประมูลรวม"])),
    staffReceived: formatNumber(pickValue(data, ["total_staff_amount", "staff_received", "staff_total", "employee_received", "staff_income", "ยอดรวมพนักงานได้รับ"])),
    shopReceived: formatNumber(pickValue(data, ["total_shop_amount", "shop_received", "shop_total", "store_received", "shop_income", "ยอดรวมร้านได้รับ"])),
    topRoomRows: extractTopRows(data, ["top_opened", "top_staff_rooms", "top_room_staff", "staff_room_top", "rooms_by_staff", "staff_rooms", "opened_by_staff"]),
    topAmountRows: extractTopRows(data, ["top_earned", "top_staff_amounts", "top_staff_revenue", "staff_amount_top", "staff_sales_top", "revenue_by_staff", "staff_totals", "earned_by_staff"]),
  };
}

function latestReportObject(payload: any): Record<string, any> {
  if (!payload || typeof payload !== "object") return {};

  if (!Array.isArray(payload) && payload.lastday && typeof payload.lastday === "object") {
    return payload.lastday as Record<string, any>;
  }

  if (!Array.isArray(payload) && payload.current && typeof payload.current === "object") {
    const current = payload.current as Record<string, any>;
    return {
      ...current,
      start: payload.current_period_start,
      end: payload.last_sent_at || payload.updated_at,
    };
  }

  if (Array.isArray(payload)) {
    return payload
      .filter(item => item && typeof item === "object")
      .sort((a, b) => String(b.created_at || b.date || b.start_time || b.period_start || "").localeCompare(String(a.created_at || a.date || a.start_time || a.period_start || "")))[0] || {};
  }

  const values = Object.values(payload).filter(item => item && typeof item === "object");
  const hasSummaryFields = [
    "opened_count",
    "closed_count",
    "total_final_price",
    "total_staff_amount",
    "total_shop_amount",
    "total_rooms",
    "closed_rooms",
    "staff_received",
    "shop_received",
    "top_staff_rooms",
    "top_opened",
  ].some(key => key in payload);
  if (hasSummaryFields || values.length === 0) return payload;

  return values.sort((a: any, b: any) => String(b.created_at || b.date || b.start_time || b.period_start || "").localeCompare(String(a.created_at || a.date || a.start_time || a.period_start || "")))[0] as Record<string, any>;
}

function extractAmountForStaff(payload: any, staffId: string): number {
  if (!payload || typeof payload !== "object") return 0;

  // auction_staff_shop.json ของบอทเก็บยอดจริงไว้ในรูปแบบ:
  // { totals: { "DISCORD_ID": amount }, summary_channel_id, summary_message_id }
  // แต่เผื่อรองรับ format อื่น ๆ ที่เคยใช้กับหน้าเว็บด้วย
  const containers = [
    pickValue(payload, ["totals", "staff_totals", "balances", "staff_balances", "shop_totals", "shop_balances"]),
    payload,
  ];

  for (const container of containers) {
    const amount = extractAmountFromStaffContainer(container, staffId);
    if (amount !== null) return amount;
  }

  return 0;
}

function extractAmountFromStaffContainer(container: any, staffId: string): number | null {
  if (!container || typeof container !== "object") return null;

  if (Array.isArray(container)) {
    const row = container.find(item => item && typeof item === "object" && staffIdMatches(item, staffId));
    return row ? extractAmount(row) : null;
  }

  if (Object.prototype.hasOwnProperty.call(container, staffId)) {
    return extractAmount(container[staffId]);
  }

  for (const value of Object.values(container)) {
    if (value && typeof value === "object" && staffIdMatches(value, staffId)) {
      return extractAmount(value);
    }
  }

  return null;
}

function extractTopRows(data: Record<string, any>, keys: string[]): LeaderboardRow[] {
  const value = pickValue(data, keys);
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (Array.isArray(item)) {
          return {
            discordId: String(item[0] || index + 1),
            count: extractAmount(item[1]),
          };
        }
        return {
          discordId: pickStaffId(item) || String(index + 1),
          displayName: pickName(item),
          count: extractAmount(item),
        };
      })
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
  if (Array.isArray(value)) return extractAmount(value[1]);
  if (!value || typeof value !== "object") return 0;

  const direct = pickValue(value, [
    "amount",
    "total",
    "balance",
    "pending",
    "value",
    "count",
    "shop_total",
    "shop_amount",
    "pending_shop",
    "remaining",
    "debt",
    "owed",
    "unpaid",
    "bonus",
    "ยอด",
    "ยอดค้าง",
    "ยอดค้างชำระร้าน",
  ]);
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
  return Number.isFinite(amount) ? amount.toLocaleString("en-US") : "-";
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US");
}

function formatDateText(value: any) {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value);
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return raw;
}
