export type Role = "guest" | "user" | "staff" | "admin" | "owner" | "owner_dev";

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


export type WebStaffCommand = {
  id: string;
  action: "upsert_staff" | "remove_staff";
  staff_id: string;
  waiting_category_id?: string;
  note?: string;
  actor_id?: string;
  created_at: string;
  status?: "pending" | "processed" | "error";
  processed_at?: string;
  error?: string;
};

export type WebStaffCommandsPayload = {
  commands: WebStaffCommand[];
  updated_at?: string;
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
