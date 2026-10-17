import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { ReviewClient } from "./review-client";
import type { Submission } from "@/types";
import { CopyRoomCode } from "./copy-room-code";
export default async function RoomDashboardPage({params}: {
            params:
            Promise< {id:string}>
        }) {
	const {id}=await params;
	const supabase=await createSupabaseServerClient();
	const {data:{user}}=await supabase.auth.getUser();
	if(!user)redirect("/");
	const admin=createSupabaseAdminClient();
	const {data:room}=await admin.from("rooms").select("id,room_code,title,description,deadline,status").eq("room_code",id.toUpperCase()).eq("dosen_id",user.id).maybeSingle();
	if(!room)notFound();
	const {data:subs}=await admin.from("submissions").select("id,room_id,student_name,student_nim,file_path,status,score,feedback,rubric_breakdown,ai_risk,created_at").eq("room_id",room.id).order("created_at", {ascending:false});
	const ids=(subs??[]).map(s=>s.id);
	const [ {data:evaluations}, {data:finalGrades}]=await Promise.all([ids.length?admin.from("evaluations").select("submissions_id,suggested_total,feedback,similarity_score,ai_status").in("submissions_id",ids):Promise.resolve({data:[]}),ids.length?admin.from("final_grades").select("submissions_id,final_score,final_feedback").in("submissions_id",ids):Promise.resolve({data:[]})]);
	const evalMap=new Map((evaluations??[]).map(x=>[x.submissions_id,x]));
	const finalMap=new Map((finalGrades??[]).map(x=>[x.submissions_id,x]));
const rows:
	Submission[]=(subs??[]).map(s=>( {
...s,rubric_breakdown:
		s.rubric_breakdown??null,ai_risk:s.ai_risk??null,similarity_score:evalMap.get(s.id)?.similarity_score??0,ai_status:evalMap.get(s.id)?.ai_status??null,final_score:finalMap.get(s.id)?.final_score??null,final_feedback:finalMap.get(s.id)?.final_feedback??null
	}));
	return <main className="min-h-screen pb-12"><Navbar/><div className="mx-auto mt-6 w-[min(94%,1280px)]"><section className="k-panel p-6 md:p-10"><div className="mb-6"><Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"><ArrowLeft className="h-4 w-4"/>Kembali ke Dashboard Utama</Link></div><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex flex-wrap items-center gap-3">
  <p className="text-sm font-bold uppercase tracking-widest">
    Room {room.room_code}
  </p>

  <CopyRoomCode roomCode={room.room_code} />
</div><h1 className="mt-2 text-4xl font-bold"> {room.title}</h1><p className="mt-2 max-w-2xl text-lg"> {room.description}</p></div><div className="rounded-2xl bg-white/50 px-5 py-3 text-right"><div className="text-sm">Deadline</div><b> {room.deadline?new Date(room.deadline).toLocaleString("id-ID"):"-"}</b></div></div><div className="mt-10"><ReviewClient roomCode= {room.room_code} submissions= {rows}/></div></section></div></main>
}