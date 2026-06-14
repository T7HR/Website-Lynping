-- ตารางเดียวกับ main.py: SUPABASE_TABLE_AUCTION_V2 = auction_products_v2
create table if not exists public.auction_products_v2 (
  key text primary key,
  file_name text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists auction_products_v2_updated_at_idx
on public.auction_products_v2 (updated_at desc);

-- ใช้ service_role key ฝั่ง server เท่านั้น ไม่ต้องเปิด public policy
alter table public.auction_products_v2 enable row level security;

-- seed rows ที่เว็บและบอทใช้ร่วมกัน
insert into public.auction_products_v2 (key, file_name, payload)
values
  ('auction_stats.json', 'auction_stats.json', '{"scoreboard_message_id": null, "sellers": {}, "winners": {}}'::jsonb),
  ('auction_requests.json', 'auction_requests.json', '{}'::jsonb),
  ('auction_results.json', 'auction_results.json', '{}'::jsonb),
  ('auction_users.json', 'auction_users.json', '[]'::jsonb),
  ('web_bot_settings.json', 'web_bot_settings.json', '{"owner_id":"617690449049681920","admins":{},"staff":{},"staff_manager_ids":["617690449049681920"]}'::jsonb),
  ('web_audit_logs.json', 'web_audit_logs.json', '[]'::jsonb)
on conflict (key) do nothing;
