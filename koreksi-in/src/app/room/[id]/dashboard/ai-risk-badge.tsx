import { Badge } from "@/components/ui/badge";
import type { AiRisk } from "@/types";
export function AiRiskBadge({ risk }: { risk: AiRisk }) {
  const cls =
    risk === "high"
      ? "bg-red-200 text-red-900"
      : risk === "medium"
        ? "bg-yellow-200 text-yellow-900"
        : "bg-green-200 text-green-900";

  const label =
    risk === "high"
      ? "TINGGI"
      : risk === "medium"
        ? "SEDANG"
        : "RENDAH";

  return <Badge className={cls}>{label}</Badge>;
}