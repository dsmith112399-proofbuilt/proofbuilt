export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${
        styles[normalized] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}