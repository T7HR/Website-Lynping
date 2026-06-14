# Bot patch สำหรับเชื่อมเว็บกลับเข้า main.py

เว็บนี้ใช้ Supabase table เดียวกับ `main.py` คือ `auction_products_v2` และเขียนข้อมูลสิทธิ์เว็บลง row:

```txt
web_bot_settings.json
auction_users.json
```

แต่ใน `main.py` เดิมของคุณ ระบบ Supabase sync เป็นแนว **local JSON -> Supabase** เป็นหลัก ดังนั้นถ้า Owner เพิ่ม Admin/Staff ในเว็บ บอทจะยังไม่เห็นค่าทันที จนกว่าจะเพิ่ม patch pull ฝั่งบอท

## วิธีใส่ patch

1. เปิดไฟล์ `main.py`
2. หาแถวนี้:

```py
STAFF_WAITING_CATEGORY_MAP: dict[int, int] = get_staff_waiting_category_map()
```

3. วางโค้ดจาก `website_sync_patch.py` ต่อท้ายแถวนั้น
4. หาแถวท้ายไฟล์:

```py
bot.run(TOKEN)
```

5. ก่อน `bot.run(TOKEN)` เพิ่ม:

```py
website_settings_pull_loop.start()
```

หลังจากนั้น เมื่อเพิ่ม Admin/Staff ในเว็บ บอทจะดึงค่าใหม่ทุก 30 วินาที

## ความหมายข้อมูลจากเว็บ

```json
{
  "owner_id": "617690449049681920",
  "admins": {
    "123": { "id": "123", "enabled": true }
  },
  "staff": {
    "456": { "id": "456", "waiting_category_id": "1443235294018277540", "enabled": true }
  },
  "staff_manager_ids": ["617690449049681920"]
}
```

- `admins` จะถูกใส่เข้า `STAFF_MANAGER_IDS`
- `staff` จะถูกใส่เข้า `STAFF_WAITING_CATEGORY_MAP`
- ถ้า staff ไม่ใส่ `waiting_category_id` patch จะใช้ `WAITING_CATEGORY_ID` เป็นค่า fallback
