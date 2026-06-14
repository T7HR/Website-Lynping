import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export async function GET() {
  const { session } = await requireUser("user");
  const requests = await getAuctionRequests();
  return NextResponse.json({ requests: Object.values<any>(requests).filter(r => String(r.requester_id) === session.id) });
}
