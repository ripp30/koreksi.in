"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRoom } from "@/app/actions/delete-room";

export function DeleteRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Hapus room ini? Semua submission, hasil review, rubrik, dan file PDF di dalam room akan ikut dihapus. Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("room_id", roomId);

      try {
        await deleteRoom(formData);
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Gagal menghapus room."
        );
      }
    });
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="w-full rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menghapus..." : "Hapus Room"}
      </button>

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}