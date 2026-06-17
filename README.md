# Lynping Auction Linked Website

เว็บ Next.js สำหรับ Vercel ที่เชื่อมกับบอท Nextcord `main.py` โดยใช้ Supabase table เดียวกัน

## สิ่งที่ทำไว้ให้แล้ว

- หน้า Public: `/`, `/rules`, `/history`, `/discord`, `/leaderboard`
- Discord OAuth login: `/api/auth/discord`, `/api/auth/callback`
- Profile: `/profile`, `/profile/stats`, `/my-auctions`, `/my-wins`
- Auction request: `/auction/request`
- Admin dashboard: `/dashboard`, `/dashboard/requests`, `/dashboard/auctions`, `/dashboard/reports`
- Owner dashboard: `/owner`, `/owner/admins`, `/owner/staff`, `/owner/logs`, `/owner/system`
- อ่าน scoreboard จาก `auction_stats.json` row ใน Supabase
- Owner เพิ่ม/ลบ Admin และพนักงานประมูล Staff ด้วย Discord user ID ได้
- Staff ที่เพิ่มจากเว็บจะ sync เข้า `web_bot_settings.json` แล้วบอทจะอัปเดต `STAFF_WAITING_CATEGORY_MAP`, `config.json` และ `auction_users.json` ให้อัตโนมัติ
- ใช้ table เดียวกับ main.py: `auction_products_v2`
- `main.py` ใน ZIP นี้ใส่ระบบดึงค่าจากเว็บกลับไปใช้จริงไว้แล้ว

## วิธีรันในเครื่อง

```bash
npm install
cp .env.example .env.local
npm run dev
```

เปิด:

```txt
http://localhost:3000
```

## ตั้งค่า Supabase

ใน Supabase SQL Editor ให้รัน:

```txt
supabase/schema.sql
```

แล้วใส่ env ใน `.env.local`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ใส่ service_role key
SUPABASE_TABLE_AUCTION_V2=auction_products_v2
OWNER_DISCORD_ID=617690449049681920
```

อย่าใส่ `SUPABASE_SERVICE_ROLE_KEY` ใน frontend หรือ `NEXT_PUBLIC_` เด็ดขาด ใช้เฉพาะ server route เท่านั้น

## ตั้งค่า Discord OAuth2

ใน Discord Developer Portal เพิ่ม Redirect URL:

```txt
http://localhost:3000/api/auth/callback
https://โดเมนของคุณ.vercel.app/api/auth/callback
```

จากนั้นตั้ง env:

```env
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
DISCORD_BOT_TOKEN=ใส่ bot token สำหรับดึงชื่อและรูปสมาชิก
DISCORD_GUILD_ID=ใส่ Discord server ID
SESSION_SECRET=สุ่มยาวๆ
```

`DISCORD_BOT_TOKEN` และ `DISCORD_GUILD_ID` ใช้สำหรับหน้า leaderboard เพื่อเปลี่ยน Discord ID/mention ให้เป็นชื่อสมาชิกใน server และรูปโปรไฟล์จริง ถ้าไม่ใส่ เว็บจะ fallback เป็น Discord ID กับรูป default

## Deploy Vercel

1. push โค้ดขึ้น GitHub
2. Import repo ใน Vercel
3. ใส่ Environment Variables ให้ครบ
4. Deploy

## เชื่อมเว็บกับบอท main.py

ใน ZIP นี้ `main.py` ถูกปรับให้เชื่อมกับเว็บแล้ว โดยใช้ Supabase เป็นตัวกลาง เพราะเว็บบน Vercel ไม่สามารถเขียนไฟล์บนเครื่อง/VPS ที่รันบอทได้โดยตรง

Flow การเพิ่ม/ลบพนักงานประมูล:

```txt
หน้าเว็บ /owner/staff
→ API /api/owner/staff
→ เขียน web_bot_settings.json ใน Supabase
→ main.py ดึงทุก SUPABASE_PULL_EVERY_SECONDS วินาที
→ main.py เขียนไฟล์ local ของบอท:
   - web_bot_settings.json
   - config.json ค่า STAFF_WAITING_CATEGORY_MAP
   - auction_users.json
```

สิ่งที่ต้องตั้งเหมือนกันทั้งเว็บและบอท:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_TABLE_AUCTION_V2=auction_products_v2
OWNER_DISCORD_ID=617690449049681920
```

เวลาจะเพิ่มพนักงาน ให้ใส่ `Discord user ID` และ `Waiting category ID` ของหมวดรอส่งของของพนักงานคนนั้น ถ้าไม่ใส่ waiting category บอทจะใช้ `WAITING_CATEGORY_ID` ค่า default จาก `config.json`

## ไฟล์สำคัญ

```txt
lib/auctionStore.ts      อ่าน/เขียน JSON mirror ใน Supabase
lib/session.ts           signed cookie session
lib/discordOAuth.ts      Discord OAuth2
app/owner/admins         เพิ่ม admin
app/owner/staff          เพิ่ม staff
supabase/schema.sql      ตารางเดียวกับ main.py
bot-patch/               patch ฝั่งบอท
```
