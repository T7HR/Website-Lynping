import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/authGuard";
import { getAuctionTranscriptById, getAuctionTranscripts } from "@/lib/auctionStore";
import { normalizeAuctionTranscripts, type TranscriptMessage } from "@/lib/transcripts";

export default async function DashboardTranscriptsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser("staff");
  const params = await searchParams;
  const transcripts = normalizeAuctionTranscripts(await getAuctionTranscripts());
  const selectedMeta = transcripts.find((item) => item.id === params.id) || transcripts[0];
  const selectedDetail = selectedMeta ? await getAuctionTranscriptById(selectedMeta.id) : null;
  const selected = selectedDetail
    ? normalizeAuctionTranscripts({ [selectedMeta.id]: selectedDetail })[0] || selectedMeta
    : selectedMeta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติแชทห้องประมูล"
        description="ดู transcript ห้องประมูลจากสารบัญ auction_transcripts.json และโหลดรายละเอียดเฉพาะห้องที่เลือก"
      />

      {transcripts.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-black text-white">ยังไม่มีประวัติแชท</p>
          <p className="mt-2 text-sm text-zinc-400">เมื่อบอท sync auction_transcripts.json แล้ว รายการจะขึ้นที่หน้านี้</p>
        </div>
      ) : (
        <div className="transcript-layout grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="card h-fit overflow-hidden">
            <div className="border-b border-white/10 p-4">
              <p className="panel-title">Transcripts</p>
              <p className="mt-1 text-sm text-zinc-400">{transcripts.length.toLocaleString("th-TH")} ห้อง</p>
            </div>
            <div className="transcript-list max-h-[72vh] overflow-y-auto p-2">
              {transcripts.map((item) => {
                const active = item.id === selected?.id;
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/transcripts?id=${encodeURIComponent(item.id)}`}
                    className={`block rounded-lg border p-3 transition ${
                      active
                        ? "border-red-400/45 bg-red-600/15"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">#{item.channelName}</p>
                        <p className="mt-1 truncate text-xs text-zinc-400">{item.title}</p>
                      </div>
                      <span className="badge shrink-0">{item.messageCount}</span>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">{formatDate(item.closedAt || item.createdAt)}</p>
                  </Link>
                );
              })}
            </div>
          </aside>

          {selected && (
            <section className="card overflow-hidden">
              <div className="border-b border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="panel-title">View Transcript</p>
                    <h2 className="mt-1 text-2xl font-black text-white">#{selected.channelName}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{selected.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.channelId && <span className="badge">ID {selected.channelId}</span>}
                    <span className="badge">{selected.messageCount.toLocaleString("th-TH")} messages</span>
                  </div>
                </div>
              </div>

              <div className="transcript-messages max-h-[74vh] space-y-5 overflow-y-auto p-5">
                {selected.messages.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
                    transcript นี้ยังไม่มีข้อความ หรือ raw text ยังไม่อยู่ในรูปแบบที่อ่านได้
                  </div>
                ) : (
                  selected.messages.map((message) => <TranscriptBubble key={message.id} message={message} />)
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function TranscriptBubble({ message }: { message: TranscriptMessage }) {
  const initials = message.authorName.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <article className="transcript-bubble flex gap-3">
      {message.authorAvatarUrl ? (
        <img src={message.authorAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600/25 text-xs font-black text-red-100">
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black text-white">{message.authorName}</p>
          {message.isBot && <span className="rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-black text-white">BOT</span>}
          <p className="text-xs text-zinc-500">{formatDate(message.createdAt)}</p>
        </div>

        {message.content && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-100">{message.content}</p>
        )}

        {message.attachments.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {message.attachments.map((attachment, index) => (
              <a
                key={`${attachment.url}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-zinc-200 hover:border-red-400/40"
              >
                {isImageUrl(attachment.url) ? (
                  <img src={attachment.url} alt={attachment.filename || "attachment"} className="max-h-56 w-full object-cover" />
                ) : null}
                <span className="block truncate p-3">{attachment.filename || attachment.url}</span>
              </a>
            ))}
          </div>
        )}

        {message.embeds.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.embeds.map((embed, index) => (
              <div key={`${embed.title || "embed"}-${index}`} className="border-l-4 border-indigo-500 bg-white/[0.05] p-3">
                <p className="font-bold text-white">{embed.title || "Embed"}</p>
                {embed.description && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{embed.description}</p>}
                {embed.image && <img src={embed.image} alt="" className="mt-3 max-h-72 rounded-lg object-cover" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);
}
