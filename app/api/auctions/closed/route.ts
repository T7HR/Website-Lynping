import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { getAuctionResults } from "@/lib/auctionStore";

export async function GET() {
  await requireUser("user");
  return NextResponse.json({ auctions: await getAuctionResults() });
}
