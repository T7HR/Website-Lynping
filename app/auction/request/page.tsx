import { PageHeader } from "@/components/PageHeader";
import { AuctionRequestForm } from "@/components/AuctionRequestForm";
import { requireUser } from "@/lib/authGuard";

export default async function AuctionRequestPage() {
  await requireUser("user");
  return (
    <div className="space-y-6">
      <PageHeader title="ส่งคำขอลงของประมูล" description="ข้อมูลจะถูกเขียนเข้า auction_requests.json row ใน Supabase table เดียวกับบอท" />
      <AuctionRequestForm />
    </div>
  );
}
