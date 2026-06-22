export type AuctionCardItem = {
  id: string;
  name: string;
  imageUrl?: string;
  openPrice: string;
  stepPrice: string;
  buyoutPrice: string;
  closeTime: string;
  status: string;
  createdAt?: string;
};

const openStatuses = new Set(["open", "opened", "active", "live", "running", "approved"]);

export function toAuctionCardItems(input: Record<string, any> | any[]): AuctionCardItem[] {
  const entries = Array.isArray(input) ? input.map((value, index) => [String(index), value]) : Object.entries(input || {});

  return entries
    .map(([key, value]) => normalizeAuctionItem(String(key), value))
    .filter((item): item is AuctionCardItem => Boolean(item))
    .sort((a, b) => String(b.createdAt || b.id).localeCompare(String(a.createdAt || a.id)));
}

export function getOpenAuctionItems(input: Record<string, any> | any[]) {
  return toAuctionCardItems(input).filter(item => openStatuses.has(item.status.toLowerCase()));
}

function normalizeAuctionItem(key: string, value: any): AuctionCardItem | null {
  const row = Array.isArray(value) && value.length >= 2 && typeof value[1] === "object" ? value[1] : value;
  if (!row || typeof row !== "object") return null;

  const id = pickString(row, ["id", "request_id", "auction_id", "channel_id", "message_id"]) || key;
  const name = pickString(row, ["name", "item_name", "title", "product_name", "ชื่อสินค้า"]) || "ไม่ระบุชื่อสินค้า";

  return {
    id,
    name,
    imageUrl: pickString(row, ["image_url", "image", "img", "thumbnail", "url", "รูปสินค้า"]),
    openPrice: pickString(row, ["open_price", "start_price", "starting_price", "price_open", "เปิด", "ราคาเปิด"]) || "-",
    stepPrice: pickString(row, ["step_price", "bid_step", "min_bid", "bid_increment", "บิด", "บิดทีละ"]) || "-",
    buyoutPrice: pickString(row, ["buyout_price", "buyout", "instant_price", "knock_price", "ทุบ", "ทุบโต๊ะ"]) || "-",
    closeTime: pickString(row, ["close_time", "end_time", "closing_time", "ปิด", "เวลาปิด"]) || "-",
    status: pickString(row, ["status", "state", "สถานะ"]) || "-",
    createdAt: pickString(row, ["created_at", "createdAt", "updated_at", "opened_at"]),
  };
}

function pickString(row: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}
