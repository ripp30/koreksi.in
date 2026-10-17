"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { AiRiskBadge } from "./ai-risk-badge";
import { approveSubmission, overrideScore } from "@/app/actions/review";
import type { Submission } from "@/types";

export function SubmissionDetailDialog({
  submission,
  open,
  onClose,
}: {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
}) {
  const [score, setScore] = useState(
    String(submission?.final_score ?? submission?.score ?? "")
  );

  // Feedback Final terpisah dari Feedback AI
  const [feedback, setFeedback] = useState(
    submission?.final_feedback ?? ""
  );

  const [pending, startTransition] = useTransition();

  if (!submission) return null;

  const save = (approve: boolean) =>
    startTransition(async () => {
      const fd = new FormData();

      fd.set("submission_id", submission.id);
      fd.set("score", score);
      fd.set("feedback", feedback);

      try {
        await (approve ? approveSubmission(fd) : overrideScore(fd));

        onClose();
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Gagal menyimpan.");
      }
    });

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="k-panel max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {submission.student_name}
            </h2>

            <p>{submission.student_nim}</p>
          </div>

          <AiRiskBadge risk={submission.ai_risk ?? "low"} />
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/60 p-4">
            <div className="text-sm">AI Score</div>

            <div className="text-3xl font-bold">
              {submission.score ?? "—"}
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 p-4">
            <div className="text-sm">Similarity</div>

            <div className="text-3xl font-bold">
              {submission.similarity_score}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 p-4">
            <div className="text-sm">Status</div>

            <div className="text-xl font-bold capitalize">
              {submission.status}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="font-bold">Nilai Final</label>

          <input
            className="k-input mt-2"
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </div>

        {/* Feedback dari AI - hanya ditampilkan */}
        <div className="mt-5">
          <label className="font-bold">Feedback AI</label>

          <div className="mt-2 min-h-32 whitespace-pre-wrap rounded-2xl bg-white/70 p-5">
            {submission.feedback || "Belum ada feedback dari AI."}
          </div>
        </div>

        {/* Feedback Final - terpisah dan dapat diedit */}
        <div className="mt-5">
          <label className="font-bold">Feedback Final</label>

          <textarea
            className="mt-2 min-h-32 w-full rounded-2xl bg-white p-5 outline-none"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Masukkan feedback final untuk mahasiswa..."
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={pending}
            className="k-button"
            onClick={() => save(false)}
          >
            Simpan Override
          </button>

          <button
            disabled={pending}
            className="k-button"
            onClick={() => save(true)}
          >
            Approve Nilai
          </button>

          <button
            className="rounded-2xl bg-white/70 px-6 py-3 font-bold"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </Dialog>
  );
}