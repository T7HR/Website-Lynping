export type TranscriptAttachment = {
  filename?: string;
  url: string;
};

export type TranscriptEmbed = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

export type TranscriptMessage = {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatarUrl?: string;
  isBot?: boolean;
  createdAt?: string;
  content: string;
  attachments: TranscriptAttachment[];
  embeds: TranscriptEmbed[];
};

export type TranscriptRecord = {
  id: string;
  channelId?: string;
  channelName: string;
  title: string;
  createdAt?: string;
  closedAt?: string;
  messageCount: number;
  rawText?: string;
  messages: TranscriptMessage[];
};

const DISCORD_ID_RE = /^\d{10,25}$/;

export function normalizeAuctionTranscripts(input: unknown): TranscriptRecord[] {
  const source = unwrapTranscriptSource(input);
  const entries = Array.isArray(source)
    ? source.map((value, index) => [String(readValue(value, ["id", "channel_id", "channelId"]) || index), value] as const)
    : Object.entries(source || {});

  return entries
    .map(([key, value]) => normalizeTranscriptRecord(key, value))
    .filter((item): item is TranscriptRecord => Boolean(item))
    .sort((a, b) => Date.parse(b.closedAt || b.createdAt || "0") - Date.parse(a.closedAt || a.createdAt || "0"));
}

export function parseRawTranscript(rawText: string): TranscriptMessage[] {
  const cleaned = String(rawText || "").replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const body = cleaned
    .split(/\r?\n/)
    .filter((line, index) => index > 1 || !/^Transcript ของห้อง/.test(line))
    .join("\n")
    .replace(/^-{8,}\s*/m, "")
    .trim();

  if (!body) return [];

  return body
    .split(/\n\s*\n/g)
    .map((block, index) => parseRawMessageBlock(block, index))
    .filter((message): message is TranscriptMessage => Boolean(message));
}

function unwrapTranscriptSource(input: any): Record<string, any> | any[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return {};
  if (Array.isArray(input.transcripts) || isRecord(input.transcripts)) return input.transcripts;
  if (Array.isArray(input.items) || isRecord(input.items)) return input.items;
  if (Array.isArray(input.records) || isRecord(input.records)) return input.records;
  return input;
}

function normalizeTranscriptRecord(key: string, value: any): TranscriptRecord | null {
  if (value == null) return null;

  const row = typeof value === "string" ? { raw_text: value } : value;
  if (!row || typeof row !== "object") return null;

  const channelId = String(readValue(row, ["channel_id", "channelId", "id"]) || key || "").trim();
  const id = String(readValue(row, ["id", "transcript_id", "transcriptId"]) || channelId || key).trim();
  if (!id) return null;

  const rawText = String(readValue(row, ["raw_text", "rawText", "text", "content"]) || "").trim();
  const messageSource = Array.isArray(row.messages) ? row.messages : [];
  const messages = messageSource.length > 0 ? messageSource.map(normalizeMessage).filter(Boolean) as TranscriptMessage[] : parseRawTranscript(rawText);
  const channelName = String(readValue(row, ["channel_name", "channelName", "name"]) || extractChannelName(rawText) || `auction-${channelId || id}`);
  const title = String(readValue(row, ["title", "item_name", "itemName"]) || channelName);
  const createdAt = stringifyDate(readValue(row, ["created_at", "createdAt", "exported_at", "exportedAt"]));
  const closedAt = stringifyDate(readValue(row, ["closed_at", "closedAt", "transcript_sent_at", "transcriptSentAt"]));

  return {
    id,
    channelId: channelId || undefined,
    channelName,
    title,
    createdAt,
    closedAt,
    messageCount: Number(readValue(row, ["message_count", "messageCount"]) || messages.length || 0),
    rawText: rawText || undefined,
    messages,
  };
}

function normalizeMessage(value: any, index: number): TranscriptMessage | null {
  if (!value || typeof value !== "object") return null;
  const authorId = String(readValue(value, ["author_id", "authorId", "user_id", "userId"]) || "").trim();
  return {
    id: String(readValue(value, ["id", "message_id", "messageId"]) || index),
    authorId: DISCORD_ID_RE.test(authorId) ? authorId : undefined,
    authorName: String(readValue(value, ["author_name", "authorName", "username", "name"]) || "Unknown"),
    authorAvatarUrl: String(readValue(value, ["author_avatar_url", "authorAvatarUrl", "avatar_url", "avatarUrl"]) || "") || undefined,
    isBot: Boolean(readValue(value, ["is_bot", "isBot", "bot"])),
    createdAt: stringifyDate(readValue(value, ["created_at", "createdAt", "timestamp"])),
    content: String(readValue(value, ["content", "message", "text"]) || ""),
    attachments: normalizeAttachments(value.attachments),
    embeds: normalizeEmbeds(value.embeds),
  };
}

function parseRawMessageBlock(block: string, index: number): TranscriptMessage | null {
  const text = block.trim();
  if (!text || text === "ไม่มีข้อความในช่องนี้") return null;

  const match = text.match(/^\[(.+?)\]\s+(.+?)\s+\((\d{10,25})\):\s*([\s\S]*)$/);
  if (!match) {
    return {
      id: `raw-${index}`,
      authorName: "System",
      content: text,
      attachments: [],
      embeds: [],
    };
  }

  const [, timestamp, authorName, authorId, rest] = match;
  const lines = rest.split(/\r?\n/);
  const contentLines: string[] = [];
  const attachments: TranscriptAttachment[] = [];
  const embeds: TranscriptEmbed[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^\s+/, "");
    const attachment = cleaned.match(/^\[ไฟล์แนบ\]\s*(.*?):\s*(https?:\/\/\S+)/);
    const embed = cleaned.match(/^\[EMBED จำนวน\s*(\d+)\]/);
    if (attachment) {
      attachments.push({ filename: attachment[1], url: attachment[2] });
    } else if (embed) {
      embeds.push({ title: `Embed จำนวน ${embed[1]}` });
    } else {
      contentLines.push(line);
    }
  }

  return {
    id: `raw-${index}`,
    authorId,
    authorName,
    createdAt: parseThaiTimestamp(timestamp),
    content: contentLines.join("\n").trim(),
    attachments,
    embeds,
  };
}

function normalizeAttachments(input: any): TranscriptAttachment[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === "string") return { url: item };
      const url = String(readValue(item, ["url", "proxy_url", "proxyUrl"]) || "");
      return url ? { url, filename: String(readValue(item, ["filename", "name"]) || "") || undefined } : null;
    })
    .filter((item): item is TranscriptAttachment => Boolean(item));
}

function normalizeEmbeds(input: any): TranscriptEmbed[] {
  if (!Array.isArray(input)) return [];
  const embeds: TranscriptEmbed[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    embeds.push({
      title: String(item.title || "") || undefined,
      description: String(item.description || "") || undefined,
      image: String(item.image || item.image_url || item.imageUrl || "") || undefined,
      url: String(item.url || "") || undefined,
    });
  }
  return embeds;
}

function extractChannelName(rawText: string) {
  const match = rawText.match(/^Transcript ของห้อง\s+(.+?)\s+\(ID:\s*(\d+)\)/m);
  return match?.[1];
}

function parseThaiTimestamp(value: string) {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return value;
  const [, hour, minute, second, day, month, year] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
}

function stringifyDate(value: any) {
  if (!value) return undefined;
  return typeof value === "string" ? value : String(value);
}

function readValue(row: any, keys: string[]) {
  if (!row || typeof row !== "object") return undefined;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return undefined;
}

function isRecord(value: any): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
