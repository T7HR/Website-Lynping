"""
Patch for auction-V2/main.py

Goal:
  Save auction channel transcripts into auction_transcripts.json so the web
  backoffice can show them at /dashboard/transcripts.

Where to edit in main.py:
  1. Add "auction_transcripts.json" to MANAGED_AUCTION_V2_FILES.
  2. Paste the helpers below near the existing Transcript helper.
  3. After this line in the close flow:

       transcript_path = await export_channel_transcript_to_txt(channel)

     add:

       try:
           await export_channel_transcript_to_web_json(
               channel,
               txt_path=transcript_path,
               old_channel_name=old_channel_name,
           )
       except Exception as e:
           print(f"[WARN] web transcript save failed for {channel.id}: {e}")

The helper writes a normal local JSON file first. Your existing Supabase sync
loop will upload it automatically, and it also tries one immediate upsert.
"""

AUCTION_TRANSCRIPT_WEB_FILE = "auction_transcripts.json"


def load_auction_transcripts() -> dict:
    data = _read_json_file(AUCTION_TRANSCRIPT_WEB_FILE, {})
    return data if isinstance(data, dict) else {}


def save_auction_transcripts(data: dict):
    _write_json_file(AUCTION_TRANSCRIPT_WEB_FILE, data)


def _web_transcript_avatar_url(author) -> str | None:
    try:
        return str(author.display_avatar.url)
    except Exception:
        return None


def _web_transcript_text(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text == "Embed.Empty":
        return None
    return text


def _web_transcript_embed_payload(embed) -> dict:
    image_url = None
    try:
        if getattr(embed, "image", None) and embed.image.url:
            image_url = str(embed.image.url)
    except Exception:
        image_url = None

    return {
        "title": _web_transcript_text(getattr(embed, "title", None)),
        "description": _web_transcript_text(getattr(embed, "description", None)),
        "url": _web_transcript_text(getattr(embed, "url", None)),
        "image": image_url,
    }


async def export_channel_transcript_to_web_json(
    channel: nextcord.TextChannel,
    *,
    txt_path: str | None = None,
    old_channel_name: str | None = None,
):
    messages: list[dict] = []

    async for msg in channel.history(limit=None, oldest_first=True):
        messages.append({
            "id": str(msg.id),
            "author_id": str(msg.author.id),
            "author_name": getattr(msg.author, "display_name", None) or getattr(msg.author, "name", "Unknown"),
            "author_avatar_url": _web_transcript_avatar_url(msg.author),
            "is_bot": bool(getattr(msg.author, "bot", False)),
            "created_at": msg.created_at.astimezone(THAI_TZ).isoformat(),
            "content": msg.content or "",
            "attachments": [
                {
                    "filename": att.filename,
                    "url": att.url,
                }
                for att in msg.attachments
            ],
            "embeds": [_web_transcript_embed_payload(embed) for embed in msg.embeds],
        })

    raw_text = ""
    if txt_path and os.path.exists(txt_path):
        try:
            with open(txt_path, "r", encoding="utf-8-sig", errors="replace") as f:
                raw_text = f.read()
        except Exception:
            raw_text = ""

    now_iso = datetime.now(THAI_TZ).isoformat()
    transcript_id = str(channel.id)
    data = load_auction_transcripts()
    data[transcript_id] = {
        "id": transcript_id,
        "channel_id": str(channel.id),
        "channel_name": old_channel_name or channel.name,
        "title": old_channel_name or channel.name,
        "created_at": now_iso,
        "closed_at": now_iso,
        "message_count": len(messages),
        "messages": messages,
        "raw_text": raw_text,
    }

    # Keep the file from growing forever. Adjust if you want more history.
    if len(data) > 300:
        sorted_items = sorted(
            data.items(),
            key=lambda item: str(item[1].get("closed_at") or item[1].get("created_at") or ""),
            reverse=True,
        )
        data = dict(sorted_items[:300])

    save_auction_transcripts(data)

    try:
        await _supabase_upsert_v2(AUCTION_TRANSCRIPT_WEB_FILE, data)
    except Exception as e:
        print(f"[WARN] immediate transcript supabase sync failed: {e}")

    return data[transcript_id]
