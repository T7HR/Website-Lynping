export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card stat-card p-5">
      <div className="mb-4 h-1 w-10 rounded-full bg-red-500" />
      <p className="text-sm font-semibold text-zinc-400">{label}</p>
      <p className="stat-card-value mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>}
    </div>
  );
}
