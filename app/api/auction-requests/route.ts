import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { appendAuditLog, getAuctionRequests, saveAuctionRequests } from "@/lib/auctionStore";

export async function POST(req: NextRequest) {
  const { session } = await requireUser("user");
  const body = await req.json();
  const requests = await getAuctionRequests();
  const id = String(Date.now());
  requests[id] = {
    id,
    requester_id: session.id,
    name: String(body.name || "").trim(),
    image_url: String(body.image_url || "").trim(),
    open_price: String(body.open_price || "").trim(),
    step_price: String(body.step_price || "").trim(),
    buyout_price: String(body.buyout_price || "-").trim(),
    close_time: String(body.close_time || "").trim(),
    note: String(body.note || "").trim(),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  await saveAuctionRequests(requests);
  await appendAuditLog({ actor_id: session.id, action: "auction_request.create", target_id: id, detail: body.name });
  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  const mine = Object.values<any>(requests).filter(r => String(r.requester_id) === session.id);
  return NextResponse.json({ requests: mine });
}
