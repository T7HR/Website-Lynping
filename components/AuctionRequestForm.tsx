"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuctionRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const body = Object.fromEntries(formData.entries());
    const res = await fetch("/api/auction-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      setError("ส่งคำขอไม่สำเร็จ");
      return;
    }
    router.push("/auction/request/success");
  }

  return (
    <form action={submit} className="card grid gap-4 p-6 md:grid-cols-2">
      <input className="input" name="name" placeholder="ชื่อสินค้า" required />
      <input className="input" name="image_url" placeholder="รูปสินค้า URL" />
      <input className="input" name="open_price" placeholder="ราคาเปิดประมูล เช่น 100k" required />
      <input className="input" name="step_price" placeholder="บิดทีละ เช่น 10k" required />
      <input className="input" name="buyout_price" placeholder="ราคาทุบโต๊ะ หรือ -" />
      <input className="input" name="close_time" placeholder="เวลาปิด เช่น 21:00 หรือ 1 21:00" required />
      <textarea className="input md:col-span-2" name="note" placeholder="หมายเหตุเพิ่มเติม" rows={5} />
      {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
      <button className="btn-primary md:col-span-2" disabled={loading}>{loading ? "กำลังส่ง..." : "ส่งคำขอลงประมูล"}</button>
    </form>
  );
}
