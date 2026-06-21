"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { formatMoney } from "@/lib/reportDisplay";

type StaffMoneyLiveCardProps = {
  title: string;
  initialRows: LeaderboardRow[];
  emptyText: string;
  apiPath: string;
  pollMs?: number;
  initialRefreshedAt?: string;
};

export function StaffMoneyLiveCard({
  title,
  initialRows,
  emptyText,
  apiPath,
  pollMs = 5 * 60 * 1000,
  initialRefreshedAt,
}: StaffMoneyLiveCardProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);
  const [refreshedAt, setRefreshedAt] = useState(initialRefreshedAt || new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function refreshBalance({ silent = false }: { silent?: boolean } = {}) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) setLoading(true);
    setError("");

    try {
      const res = await fetch(apiPath, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data.rows)) setRows(data.rows);
      setRefreshedAt(data.refreshed_at || new Date().toISOString());
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("อัปเดตยอดล่าสุดไม่สำเร็จ");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshBalance({ silent: true });
    }, Math.max(30_000, pollMs));

    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [apiPath, pollMs]);

  const refreshedText = useMemo(() => {
    const date = new Date(refreshedAt);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Asia/Bangkok",
    });
  }, [refreshedAt]);

  return (
    <section className="card staff-money-card p-5">
      <div className="staff-money-head flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="panel-title">Staff Balance</p>
          <h2 className="mt-1 text-xl font-black">{title}</h2>
          <p className="mt-1 text-xs text-zinc-500">อัปเดตล่าสุด: {refreshedText}</p>
        </div>
        <button
          type="button"
          onClick={() => refreshBalance()}
          disabled={loading}
          className="staff-refresh-btn rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "กำลังอัปเดต..." : "รีเฟรชยอด"}
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

      <div className="mt-4 divide-y divide-white/10">
        {rows.map(row => (
          <div key={row.discordId} className="staff-money-row flex items-center justify-between gap-4 py-3">
            <div className="staff-money-user flex min-w-0 items-center gap-3">
              <img
                src={row.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt={row.displayName || row.discordId}
                className="h-11 w-11 shrink-0 rounded-lg border border-white/10 bg-white/10 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{row.displayName || row.discordId}</p>
                <p className="break-all text-xs text-zinc-500">Discord ID: {row.discordId}</p>
              </div>
            </div>
            <p className="staff-money-value shrink-0 text-lg font-black text-red-300">{formatMoney(row.count)}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="py-3 text-sm text-zinc-400">{emptyText}</p>}
      </div>
    </section>
  );
}
