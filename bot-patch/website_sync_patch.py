"""
Patch สำหรับ main.py ของคุณ
เป้าหมาย: ให้บอทดึง web_bot_settings.json จาก Supabase แล้วอัปเดต permission ในบอท

วิธีใช้แบบง่าย:
1) เปิด main.py
2) วางโค้ดนี้หลังบรรทัดที่ประกาศ STAFF_WAITING_CATEGORY_MAP แล้ว
   ประมาณหลัง:
      STAFF_WAITING_CATEGORY_MAP: dict[int, int] = get_staff_waiting_category_map()
3) ก่อน bot.run(TOKEN) ให้เพิ่ม:
      website_settings_pull_loop.start()

หมายเหตุ:
- เว็บจะเขียน row: web_bot_settings.json ใน table auction_products_v2
- โค้ดนี้จะ pull row ดังกล่าวมา update STAFF_MANAGER_IDS และ STAFF_WAITING_CATEGORY_MAP
"""

WEB_BOT_SETTINGS_FILE = "web_bot_settings.json"

async def _supabase_select_payload_v2(file_name: str):
    sb = _get_supabase_v2()
    if sb is None:
        return None
    try:
        res = sb.table(SUPABASE_TABLE_AUCTION_V2).select("payload").eq("key", file_name).maybe_single().execute()
        data = getattr(res, "data", None) or {}
        return data.get("payload")
    except Exception as e:
        print(f"[WebsiteSync] pull failed for {file_name}: {e}")
        return None


def _apply_web_settings_to_runtime(settings: dict) -> None:
    global STAFF_MANAGER_IDS, STAFF_WAITING_CATEGORY_MAP

    if not isinstance(settings, dict):
        return

    owner_id = int(settings.get("owner_id") or 617690449049681920)
    admins = settings.get("admins") or {}
    staff = settings.get("staff") or {}

    manager_ids = {owner_id}
    for raw_id, info in admins.items():
        try:
            if isinstance(info, dict) and info.get("enabled") is False:
                continue
            manager_ids.add(int(info.get("id") if isinstance(info, dict) else raw_id))
        except Exception:
            pass

    staff_map: dict[int, int] = {}
    for raw_id, info in staff.items():
        try:
            if isinstance(info, dict) and info.get("enabled") is False:
                continue
            staff_id = int(info.get("id") if isinstance(info, dict) else raw_id)
            waiting_category_id = int((info or {}).get("waiting_category_id") or WAITING_CATEGORY_ID)
            staff_map[staff_id] = waiting_category_id
        except Exception:
            pass

    STAFF_MANAGER_IDS = manager_ids
    STAFF_WAITING_CATEGORY_MAP.clear()
    STAFF_WAITING_CATEGORY_MAP.update(staff_map)
    _sync_staff_waiting_category_map_to_cfg(STAFF_WAITING_CATEGORY_MAP)

    try:
        save_allowed_users(set(manager_ids) | set(staff_map.keys()))
    except Exception:
        pass


@tasks.loop(seconds=30)
async def website_settings_pull_loop():
    payload = await _supabase_select_payload_v2(WEB_BOT_SETTINGS_FILE)
    if payload:
        _apply_web_settings_to_runtime(payload)


@website_settings_pull_loop.before_loop
async def _before_website_settings_pull_loop():
    try:
        await bot.wait_until_ready()
    except Exception:
        pass
