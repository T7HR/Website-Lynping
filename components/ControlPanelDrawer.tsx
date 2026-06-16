"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Role } from "@/lib/types";

export type ControlPanelItem = {
  href: string;
  label: string;
  icon: string;
  group?: string;
};

export function ControlPanelDrawer({ items, role }: { items: ControlPanelItem[]; role: Role }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className="control-panel-trigger" onClick={() => setOpen(true)}>
        <span className="control-panel-trigger-mark">CP</span>
        หลังบ้าน
      </button>

      {open && mounted && createPortal(
        <div className="control-panel-layer" role="dialog" aria-modal="true" aria-label="หลังบ้าน">
          <button type="button" className="control-panel-backdrop" aria-label="ปิดหลังบ้าน" onClick={() => setOpen(false)} />
          <aside className="control-panel-drawer">
            <div className="control-panel-drawer-head">
              <div>
                <p className="panel-title">Control Panel</p>
                <h2 className="mt-1 text-xl font-black text-white">หลังบ้าน</h2>
                <p className="mt-1 text-sm text-zinc-500">จัดการระบบร้าน Lynping</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-black text-white">{role.toUpperCase()}</span>
                <button type="button" className="control-panel-close" onClick={() => setOpen(false)} aria-label="ปิด">
                  x
                </button>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              {items.map((item, index) => (
                <div key={item.href}>
                  {item.group && (
                    <p className={`${index === 0 ? "" : "mt-5"} mb-2 px-2 text-xs font-black uppercase tracking-[0.18em] text-red-300/60`}>
                      {item.group}
                    </p>
                  )}
                  <Link href={item.href} className="sidebar-link" style={{ animationDelay: `${index * 45}ms` }} onClick={() => setOpen(false)}>
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="sidebar-link-arrow">›</span>
                  </Link>
                </div>
              ))}
            </nav>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
