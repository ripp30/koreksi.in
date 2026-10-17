import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const secret = process.env.N8N_CALLBACK_SECRET;
  if (secret && request.headers.get("x-koreksi-secret") !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { submissionId, downloadUrl, questionText, answerKeyText, rubricRules } = body;
  if (!submissionId || !downloadUrl) return NextResponse.json({ error: "submissionId dan downloadUrl wajib" }, { status: 400 });
  const admin = createSupabaseAdminClient();
  try {
    await admin.from("submissions").update({ status: "processing", ai_risk: "low" }).eq("id", submissionId);
    const pdfResponse = await fetch(downloadUrl);
    if (!pdfResponse.ok) throw new Error(`PDF download gagal (${pdfResponse.status})`);
    const bytes = Buffer.from(await pdfResponse.arrayBuffer());
    const base64 = bytes.toString("base64");
    const prompt = `Anda adalah evaluator tugas akademik. Evaluasi PDF mahasiswa berdasarkan pertanyaan, kunci/acuan, dan rubrik berikut.\n\nPERTANYAAN:\n${questionText || "-"}\n\nKUNCI/ACUAN:\n${answerKeyText || "-"}\n\nRUBRIK:\n${rubricRules || "-"}\n\nKeluarkan JSON valid dengan struktur: {"suggested_total": number, "feedback": string, "similarity_score": number, "ai_risk": "low"|"medium"|"high", "rubric_breakdown": object, "extracted_text": string}. Nilai 0-100. similarity_score adalah estimasi kemiripan dengan acuan/jawaban referensi, bukan detektor plagiarisme definitif. ai_risk adalah indikator risiko berbantuan AI dan bukan keputusan final. extracted_text berisi teks yang dapat dibaca dari PDF. Berikan feedback singkat namun spesifik.`;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, { method:"POST", headers:{"Content-Type":"application/json","x-goog-api-key":geminiKey}, body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:"application/pdf",data:base64}}]}],generationConfig:{responseMimeType:"application/json",temperature:0.2}}) });
    if(!response.ok) throw new Error(`Gemini API gagal (${response.status}): ${await response.text()}`);
    const gemini=await response.json(); const text=gemini?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")||"";
    const cleaned=text.replace(/^```json\s*/i,"").replace(/\s*```$/i,""); const result=JSON.parse(cleaned);
    const evaluation={submissions_id:submissionId,scores:result.rubric_breakdown||{},suggested_total:Number(result.suggested_total)||0,feedback:String(result.feedback||""),similarity_score:Number(result.similarity_score)||0,ai_status:"completed",updated_at:new Date().toISOString()};
    const {error:evalError}=await admin.from("evaluations").upsert(evaluation,{onConflict:"submissions_id"}); if(evalError) throw evalError;
    const {error:subError}=await admin.from("submissions").update({status:"reviewed",score:evaluation.suggested_total,feedback:evaluation.feedback,rubric_breakdown:evaluation.scores,ai_risk:result.ai_risk||"low",extracted_text:result.extracted_text||null}).eq("id",submissionId); if(subError) throw subError;
    return NextResponse.json({ok:true,submissionId,score:evaluation.suggested_total});
  } catch (error) {
    const message=error instanceof Error?error.message:"Unknown error";
    await admin.from("submissions").update({status:"submitted",feedback:`Pemrosesan AI gagal: ${message}`}).eq("id",submissionId);
    await admin.from("evaluations").upsert({submissions_id:submissionId,ai_status:"failed",feedback:message,updated_at:new Date().toISOString()},{onConflict:"submissions_id"});
    return NextResponse.json({ok:false,error:message},{status:500});
  }
}
