import { stockBadge } from "@/lib/types";

export function StockBadge({ stock }: { stock: number }) {
  const { label, tone } = stockBadge(stock);
  const cls =
    tone === "success" ? "bg-emerald-800 text-white border-emerald-700" :
    tone === "warning" ? "bg-amber-700 text-white border-amber-600" :
    tone === "destructive" ? "bg-red-800 text-white border-red-700" :
    "bg-neutral-800 text-white border-neutral-700";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] font-semibold shadow-md ${cls}`}>
      {label}
    </span>
  );
}
