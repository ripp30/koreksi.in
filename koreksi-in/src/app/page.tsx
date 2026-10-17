"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter(); const [code, setCode] = useState(""); const [loading, setLoading] = useState(false);
  const login = async () => { setLoading(true); const supabase = createSupabaseBrowserClient(); const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); if (error) { setLoading(false); alert(error.message); } };
  return <main className="min-h-screen px-4 py-10"><section className="mx-auto flex min-h-[820px] w-full max-w-[760px] flex-col items-center justify-center rounded-[2.8rem] border-4 border-white/90 bg-[var(--surface)] px-8 py-12 shadow-[0_18px_50px_rgba(0,0,0,.08)]">
    <Image src="/koreksi-in-logo.png" alt="Koreksi.in" width={430} height={135} className="mb-10 w-[min(82%,430px)] object-contain" priority />
    <h1 className="text-center text-4xl font-normal md:text-5xl">Selamat Datang di Koreksi.in!</h1>
    <p className="mt-12 text-center text-xl">Masuk untuk Akses Dashboard Dosen</p>
    <button onClick={login} disabled={loading} className="mt-5 flex h-28 w-full max-w-[430px] items-center justify-center rounded-2xl border border-black bg-white text-3xl font-bold text-neutral-700 shadow-sm transition hover:scale-[1.01] disabled:opacity-60">{loading ? "Menghubungkan..." : "Masuk dengan Google"}</button>
    <p className="mt-10 max-w-lg text-center text-lg">Masukan Room Code dari dosen untuk pengumpulan tugas</p>
    <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Masukan Room Code" className="k-input mt-5 max-w-[430px] text-center text-xl" />
    <button onClick={()=>code.trim() && router.push(`/room/${code.trim()}`)} className="k-button mt-5 w-72 text-xl font-bold">Enter</button>
  </section></main>;
}
