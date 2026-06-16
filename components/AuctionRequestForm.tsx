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
    <form action={submit} className="card grid gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="panel-title">Auction Request</p>
        <h2 className="mt-1 text-xl font-black">รายละเอียดสินค้า</h2>
      </div>
      <Field label="ชื่อสินค้า"><input className="input" name="name" placeholder="เช่น รวมสกินเปิด" required /></Field>
      <Field label="รูปสินค้า URL"><input className="input" name="image_url" placeholder="https://..." /></Field>
      <Field label="ราคาเปิด"><input className="input" name="open_price" placeholder="เช่น 100k" required /></Field>
      <Field label="บิดทีละ"><input className="input" name="step_price" placeholder="เช่น 10k" required /></Field>
      <Field label="ราคาทุบ"><input className="input" name="buyout_price" placeholder="ใส่ราคา หรือ -" /></Field>
      <Field label="เวลาปิด"><input className="input" name="close_time" placeholder="เช่น 21:00 หรือ 1 21:00" required /></Field>
      <Field label="หมายเหตุเพิ่มเติม" wide><textarea className="input" name="note" placeholder="รายละเอียดที่ Staff ควรรู้" rows={5} /></Field>
      {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
      <button className="btn-primary md:col-span-2" disabled={loading}>{loading ? "กำลังส่ง..." : "ส่งคำขอลงประมูล"}</button>
    </form>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
