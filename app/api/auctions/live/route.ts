import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("user");
  const requests = await getAuctionRequests();
  return NextResponse.json({ auctions: Object.values<any>(requests).filter(r => ["pending", "approved", "open"].includes(String(r.status))) });
}
