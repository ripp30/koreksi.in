-- Jalankan penyesuaian ini di Supabase SQL Editor jika belum ada.
-- Nama tabel diasumsikan: submissions (bukan "submisiion").

-- Bucket private untuk PDF.
-- Storage bucket creation bisa dilakukan melalui Dashboard:
-- Storage > New bucket > submissions > Private.

-- Agar final_grades.upsert(..., onConflict: submissions_id) bekerja:
-- ALTER TABLE public.final_grades
-- ADD CONSTRAINT final_grades_submissions_id_key UNIQUE (submissions_id);

-- Pastikan RLS/policy disesuaikan dengan model akses aplikasi:
-- Dosen: CRUD rooms miliknya, read submissions milik room-nya, update submission/final_grades.
-- Mahasiswa tanpa login: insert submissions untuk room valid melalui server API.
-- Browser mahasiswa tidak diberi service role key.
