"use server";

import { revalidatePath } from "next/cache";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function deleteRoom(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Anda harus login terlebih dahulu.");
  }

  const roomId = String(formData.get("room_id") || "").trim();

  if (!roomId) {
    throw new Error("ID room tidak valid.");
  }

  const admin = createSupabaseAdminClient();

  // Pastikan room memang milik dosen yang sedang login.
  const { data: room, error: roomError } = await admin
    .from("rooms")
    .select("id, room_code")
    .eq("id", roomId)
    .eq("dosen_id", user.id)
    .maybeSingle();

  if (roomError) {
    throw new Error(`Gagal memeriksa room: ${roomError.message}`);
  }

  if (!room) {
    throw new Error("Room tidak ditemukan atau bukan milik Anda.");
  }

  // Ambil semua submission agar file PDF bisa dihapus dari Storage.
  const { data: submissions, error: submissionsError } = await admin
    .from("submissions")
    .select("id, file_path")
    .eq("room_id", room.id);

  if (submissionsError) {
    throw new Error(
      `Gagal mengambil submission: ${submissionsError.message}`
    );
  }

  const submissionIds = (submissions ?? []).map(
    (submission) => submission.id
  );

  const filePaths = (submissions ?? [])
    .map((submission) => submission.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  // Hapus file PDF dari Storage.
  for (let i = 0; i < filePaths.length; i += 100) {
    const batch = filePaths.slice(i, i + 100);

    const { error: storageError } = await admin.storage
      .from("submissions")
      .remove(batch);

    if (storageError) {
      throw new Error(
        `Gagal menghapus file submission: ${storageError.message}`
      );
    }
  }

  /*
   * Hapus data yang bergantung pada submission terlebih dahulu.
   * Ini dilakukan manual karena FK database saat ini belum
   * menggunakan ON DELETE CASCADE.
   */

  if (submissionIds.length > 0) {
    const { error: finalGradesError } = await admin
      .from("final_grades")
      .delete()
      .in("submission_id", submissionIds);

    if (finalGradesError) {
      throw new Error(
        `Gagal menghapus final grades: ${finalGradesError.message}`
      );
    }

    const { error: evaluationsError } = await admin
      .from("evaluations")
      .delete()
      .in("submission_id", submissionIds);

    if (evaluationsError) {
      throw new Error(
        `Gagal menghapus evaluations: ${evaluationsError.message}`
      );
    }
  }

  // Hapus submission.
  const { error: submissionsDeleteError } = await admin
    .from("submissions")
    .delete()
    .eq("room_id", room.id);

  if (submissionsDeleteError) {
    throw new Error(
      `Gagal menghapus submission: ${submissionsDeleteError.message}`
    );
  }

  // Hapus rubrik yang terkait dengan room.
  const { error: rubricsError } = await admin
    .from("rubrics")
    .delete()
    .eq("room_id", room.id);

  if (rubricsError) {
    throw new Error(
      `Gagal menghapus rubrik: ${rubricsError.message}`
    );
  }

  // Terakhir baru hapus room.
  const { error: deleteError } = await admin
    .from("rooms")
    .delete()
    .eq("id", room.id)
    .eq("dosen_id", user.id);

  if (deleteError) {
    throw new Error(`Gagal menghapus room: ${deleteError.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/room/${room.room_code}/dashboard`);

  return { ok: true };
}