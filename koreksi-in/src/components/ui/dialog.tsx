"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const fn = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" onMouseDown={onClose}><div className="w-full max-w-2xl" onMouseDown={(e) => e.stopPropagation()}>{children}</div></div>;
}
