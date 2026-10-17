"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import type { Submission } from "@/types";
import { SubmissionsTable } from "./submissions-table";
import { SubmissionDetailDialog } from "./submission-detail-dialog";
export function ReviewClient({roomCode,submissions}:{roomCode:string;submissions:Submission[]}){const[selected,setSelected]=useState<Submission|null>(null);const handleExport=()=>{const rows=submissions.map(s=>({ID:s.id,Mahasiswa:s.student_name,NIM:s.student_nim,Nilai:s.final_score??s.score??"",Similarity:`${s.similarity_score}%`,"AI Risk":s.ai_risk??"-",Status:s.status,AI:s.ai_status??"-",Feedback:s.final_feedback??s.feedback??""}));const ws=XLSX.utils.json_to_sheet(rows);ws["!cols"]=[{wch:26},{wch:24},{wch:18},{wch:10},{wch:14},{wch:12},{wch:16},{wch:14},{wch:60}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Hasil Review");XLSX.writeFile(wb,`koreksi-in-review-${roomCode}.xlsx`)};return <><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Hasil Review</h2><button className="k-button" onClick={handleExport}>Export Data XLSX</button></div><SubmissionsTable submissions={submissions} onSelect={setSelected}/><SubmissionDetailDialog submission={selected} open={!!selected} onClose={()=>setSelected(null)}/></>}
