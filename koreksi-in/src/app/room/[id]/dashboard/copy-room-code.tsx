"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyRoomCode({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Gagal menyalin kode room.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
      title="Salin kode room"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          Tersalin!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Salin Kode
        </>
      )}
    </button>
  );
}