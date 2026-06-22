"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "done" | "error";

export function AddAdminForm() {
  const [state, setState] = useState<FormState>("idle");
  async function submit(formData: FormData) {
    setState("loading");
    const res = await fetch("/api/owner/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_id: formData.get("discord_id"), note: formData.get("note") }),
    });
    setState(res.ok ? "done" : "error");
    if (res.ok) location.reload();
  }
  return (
    <form action={submit} className="card owner-form space-y-4 p-5">
      <div>
        <p className="panel-title">Owner Tool</p>
        <h2 className="mt-1 text-xl font-black">เพิ่ม Admin</h2>
      </div>
      <input className="input" name="discord_id" placeholder="Discord user ID" required />
      <input className="input" name="note" placeholder="Note" />
      <button className="btn-primary w-full sm:w-auto" disabled={state === "loading"}>{state === "loading" ? "กำลังบันทึก..." : "เพิ่ม Admin"}</button>
      {state === "error" && <p className="text-sm text-red-300">บันทึกไม่สำเร็จ</p>}
    </form>
  );
}

export function AddStaffForm() {
  const [state, setState] = useState<FormState>("idle");
  async function submit(formData: FormData) {
    setState("loading");
    const res = await fetch("/api/owner/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discord_id: formData.get("discord_id"),
        waiting_category_id: formData.get("waiting_category_id"),
        note: formData.get("note"),
      }),
    });
    setState(res.ok ? "done" : "error");
    if (res.ok) location.reload();
  }
  return (
    <form action={submit} className="card owner-form space-y-4 p-5">
      <div>
        <p className="panel-title">Manager Auction Staff</p>
        <h2 className="mt-1 text-xl font-black">เพิ่มพนักงานประมูลเข้าระบบ</h2>
      </div>
      <input className="input" name="discord_id" placeholder="Discord user ID" required />
      <input className="input" name="waiting_category_id" placeholder="หมวดหมู่รอส่งของ ( Category ID )" />
      <input className="input" name="note" placeholder="Note" />
      <button className="btn-primary w-full sm:w-auto" disabled={state === "loading"}>{state === "loading" ? "กำลังบันทึก..." : "Add Staff"}</button>
      {state === "error" && <p className="text-sm text-red-300">บันทึกไม่สำเร็จ</p>}
    </form>
  );
}

export function DeleteButton({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  async function remove() {
    if (!confirm("ลบรายการนี้ใช่ไหม?")) return;
    setLoading(true);
    const res = await fetch(url, { method: "DELETE" });
    setLoading(false);
    if (res.ok) location.reload();
    else alert("ลบไม่สำเร็จ");
  }
  return <button onClick={remove} disabled={loading} className="mobile-action-btn rounded-lg border border-red-300/20 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-500/25">ลบ</button>;
}
