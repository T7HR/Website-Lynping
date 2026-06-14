export type Role = "guest" | "user" | "staff" | "admin" | "owner";

export type DiscordSession = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

export type AuctionStatsPayload = {
  scoreboard_message_id?: string | number | null;
  sellers?: Record<string, { count?: number }>;
  winners?: Record<string, { count?: number }>;
};

export type WebRoleUser = {
  id: string;
  note?: string;
  enabled: boolean;
  added_by?: string;
  added_at?: string;
  waiting_category_id?: string;
};

export type WebSettingsPayload = {
  owner_id: string;
  admins: Record<string, WebRoleUser>;
  staff: Record<string, WebRoleUser>;
  staff_manager_ids: string[];
  updated_at?: string;
  updated_by?: string;
};

export type AuctionRequestPayload = Record<string, any>;
export type AuctionResultsPayload = Record<string, any>;
export type AuditLogEntry = {
  id: string;
  actor_id: string;
  action: string;
  target_id?: string;
  detail?: string;
  created_at: string;
};
