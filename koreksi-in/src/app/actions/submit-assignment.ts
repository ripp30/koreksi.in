"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export async function submitAssignment(formData: FormData) {
  const roomCode = String(formData.get("room_code") || "").trim().toUpperCase(); const studentName = String(formData.get("student_name") || "").trim(); const studentNim = String(formData.get("student_nim") || "").trim(); const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("File PDF wajib dipilih.");
  if (file.type !== "application/pdf") throw new Error("File harus PDF.");
  const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 10); if(file.size > maxMb*1024*1024) throw new Error(`Ukuran file maksimal ${maxMb} MB.`);
  const admin = createSupabaseAdminClient();
  const { data: room, error: roomError } = await admin.from("rooms").select("id, room_code, title, deadline, status, question_text, answer_key_text, rubric_rules").eq("room_code",roomCode).eq("status","active").maybeSingle();
  if(roomError || !room) throw new Error("Room tidak ditemukan atau sudah ditutup.");
  if(room.deadline && new Date(room.deadline).getTime() < Date.now()) throw new Error("Deadline pengumpulan sudah lewat.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,"_"); const filePath = `${room.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await admin.storage.from("assignment").upload(filePath, Buffer.from(await file.arrayBuffer()), { contentType:"application/pdf", upsert:false });
  if(uploadError) throw new Error(`Upload gagal: ${uploadError.message}`);
  const { data: submission, error: insertError } = await admin.from("submissions").insert({ room_id:room.id, student_name:studentName, student_nim:studentNim, file_path:filePath, status:"processing", user_id:null }).select("id").single();
  if(insertError){ await admin.storage.from("assignment").remove([filePath]); throw new Error(`Gagal menyimpan submission: ${insertError.message}`); }
  const { data: signed } = await admin.storage.from("assignment").createSignedUrl(filePath, 3600);
  const webhook = process.env.N8N_WEBHOOK_URL;
  if(webhook && signed?.signedUrl){
    
try {
    const response = await fetch(webhook, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-koreksi-secret": process.env.N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
            submission_id: submission.id,
            room_id: room.id,
            room_code: room.room_code,
            file_url: signed.signedUrl,
            studentName,
            studentNim,
            questionText: room.question_text,
            answerKeyText: room.answer_key_text,
            rubric_rules: room.rubric_rules,
        }),
    });

    const responseText = await response.text();

    console.log("Webhook URL:", webhook);
    console.log("n8n HTTP status:", response.status);
    console.log("n8n response:", responseText);

    if (!response.ok) {
        throw new Error(
            `n8n HTTP ${response.status}: ${responseText}`
        );
    }
} catch (e) {
    console.error("Webhook n8n gagal:", e);

    await admin
        .from("submissions")
        .update({
            status: "submitted",
            feedback: "Submission tersimpan, tetapi antrean AI belum berhasil dipicu.",
        })
        .eq("id", submission.id);

    throw new Error(
        "Tugas tersimpan, tetapi pemrosesan AI belum terpicu. Periksa log server."
    );
}
}
  revalidatePath(`/room/${roomCode}/dashboard`); return {ok:true, submissionId:submission.id};
}