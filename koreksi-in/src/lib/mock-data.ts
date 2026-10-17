import type { Room, Submission } from "@/types";

export const mockRoom: Room = {
  id: "room-1",
  room_code: "CV67Y5",
  title: "Tugas CPMK 01",
  description: "Kumpulkan tugas sesuai instruksi dosen.",
  deadline: "30 November 2026, 23:59",
  status: "active",
  question_text: "Jelaskan konsep dasar pengembangan aplikasi web dan berikan contoh implementasinya.",
  answer_key_text: "Jawaban ideal menjelaskan konsep frontend, backend, database, API, serta contoh implementasi yang relevan.",
  rubric_rules: "Pemahaman konsep; Ketepatan implementasi; Kualitas penjelasan; Dokumentasi.",
};

export const mockRooms: Room[] = [
  mockRoom,
  { ...mockRoom, id: "room-2", room_code: "AB12CD", title: "Tugas Basis Data", description: "Perancangan ERD dan normalisasi." },
  { ...mockRoom, id: "room-3", room_code: "ZX90KL", title: "Tugas Pemrograman Web", description: "Implementasi halaman web responsif." },
  { ...mockRoom, id: "room-4", room_code: "MN45PQ", title: "Tugas UI/UX", description: "Analisis dan rancangan antarmuka." },
];

export const mockSubmissions: Submission[] = [
  { id: "sub-1", room_id: "room-1", student_name: "An Najmi", student_nim: "H1H026030", file_path: "tugas-an-najmi.pdf", status: "reviewed", score: 88, feedback: "Pembahasan kuat dan struktur jawaban sudah baik. Perjelas bagian implementasi.", similarity_score: 12, ai_risk: "low", created_at: "17 Oktober 2026, 09:14" },
  { id: "sub-2", room_id: "room-1", student_name: "Budi Santoso", student_nim: "H1H026031", file_path: "tugas-budi.pdf", status: "reviewed", score: 82, feedback: "Konsep sudah benar, tetapi contoh implementasi masih kurang lengkap.", similarity_score: 21, ai_risk: "medium", created_at: "17 Oktober 2026, 09:32" },
  { id: "sub-3", room_id: "room-1", student_name: "Citra Lestari", student_nim: "H1H026032", file_path: "tugas-citra.pdf", status: "processing", score: 0, feedback: "Sedang dianalisis.", similarity_score: 0, ai_risk: "low", created_at: "17 Oktober 2026, 10:01" },
];
