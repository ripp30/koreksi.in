import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
export async function Navbar() {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser();
  return <header className="mx-auto mt-6 flex w-[min(94%,1280px)] items-center justify-between rounded-[2.2rem] border-4 border-white/90 bg-[var(--surface)] px-8 py-3 shadow-[0_10px_30px_rgba(0,0,0,.06)]">
    <Link href="/" className="relative h-16 w-56"><Image src="/koreksi-in-logo.png" alt="Koreksi.in" fill className="object-contain object-left" priority /></Link>
    <div className="flex items-center gap-4 text-lg font-medium">{user ? <><span className="hidden md:inline">{user.user_metadata?.full_name || user.email}</span><form action={signOut}><button className="rounded-xl bg-white/70 px-4 py-2 text-sm font-bold">Keluar</button></form></> : <Link href="/" className="underline">Login</Link>}</div>
  </header>;
}
