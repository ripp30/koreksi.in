import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=oauth", url.origin));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/?error=oauth", url.origin));
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const admin = createSupabaseAdminClient();
    await admin.from("profiles").upsert({ id: user.id, full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Dosen", email: user.email || "" }, { onConflict: "id" });
  }
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
