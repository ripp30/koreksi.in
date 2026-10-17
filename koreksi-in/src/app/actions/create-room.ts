"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { generateRoomCode } from "@/lib/utils";
export async function createRoom(formData: FormData) {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/");
  const title = String(formData.get("title") || "").trim(); const description = String(formData.get("description") || "").trim(); const questionText = String(formData.get("question_text") || "").trim(); const answerKeyText = String(formData.get("answer_key_text") || "").trim(); const rubricRules = String(formData.get("rubric_rules") || "").trim(); const deadline = String(formData.get("deadline") || "").trim() || null;
  if (!title) throw new Error("Nama tugas wajib diisi.");
  const admin = createSupabaseAdminClient(); let roomCode = generateRoomCode();
  for (let i=0;i<5;i++){ const {data: existing}=await admin.from("rooms").select("id").eq("room_code",roomCode).maybeSingle(); if(!existing) break; roomCode=generateRoomCode(); }
  const { data: room, error } = await admin.from("rooms").insert({ dosen_id:user.id, room_code:roomCode, title, description, deadline:deadline?new Date(deadline).toISOString():null, status:"active", question_text:questionText, answer_key_text:answerKeyText, rubric_rules:rubricRules }).select("id, room_code").single();
  if(error) throw new Error(error.message);
  const rubricLines = rubricRules.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const rubricRows = rubricLines.map(line=>{ const parts=line.split("|").map(x=>x.trim()); return { room_id:room.id, criterion:parts[0]||line, max_score:Number(parts[1])||0, description:parts[2]||parts[0]||line }; }).filter(x=>x.max_score>0);
  if(rubricRows.length) await admin.from("rubrics").insert(rubricRows);
  revalidatePath("/dashboard"); redirect(`/room/${room.room_code}/dashboard`);
}
