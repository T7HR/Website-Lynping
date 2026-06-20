import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionRequests, getAuctionResults } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("user");
  const [requests, results] = await Promise.all([getAuctionRequests(), getAuctionResults()]);
  return NextResponse.json({ requests, results });
}
