import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteRoomButton } from "./delete-room-button";

export default async function LecturerDashboardPage() {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: rooms } = await supabase.from("rooms").select("id, room_code, title, description, deadline, status").eq("dosen_id", user.id).order("created_at", { ascending: false });
  const roomRows = rooms ?? [];
  return <main className="min-h-screen pb-12"><Navbar/><div className="mx-auto mt-8 w-[min(94%,1280px)]"><section className="k-panel p-6 md:p-10"><div className="rounded-[2rem] border-4 border-white/90 bg-white/10 px-6 py-7 text-center md:px-10"><h1 className="text-4xl font-bold md:text-5xl">Dashboard Dosen</h1><p className="mt-3 text-lg">Kelola room tugas dan review hasil pengumpulan mahasiswa.</p></div><div className="mt-8 rounded-[2rem] border-4 border-white/90 bg-white/10 p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl font-bold">Room Tugas</h2><Link href="/room/create" className="k-button">+ Buat Room Tugas</Link></div>{roomRows.length===0 ? <div className="mt-6 rounded-2xl bg-white/50 p-8 text-center">Belum ada room. Buat room pertama kamu.</div> : <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{roomRows.map(room=><div key={room.id} className="rounded-[1.7rem] border-4 border-white/90 bg-white/10 p-6 transition hover:-translate-y-1 hover:bg-white/20"><p className="text-sm font-bold uppercase tracking-widest opacity-70">Room {room.room_code}</p><h3 className="mt-3 text-2xl font-semibold">{room.title}</h3><p className="mt-3 min-h-14 text-sm leading-6">{room.description || "Tidak ada deskripsi."}</p><div className="mt-5 flex items-center justify-between text-sm"><span className="capitalize">{room.status}</span><Link href={`/room/${room.room_code}/dashboard`} className="font-bold underline underline-offset-4">Lihat Review</Link></div><DeleteRoomButton roomId={room.id} /></div>)}</div>}</div></section></div></main>;
}
