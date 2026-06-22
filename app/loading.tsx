export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card h-28 animate-pulse bg-white/[0.04]" />
        <div className="card h-28 animate-pulse bg-white/[0.04]" />
        <div className="card h-28 animate-pulse bg-white/[0.04]" />
      </div>
      <div className="card mt-4 h-64 animate-pulse bg-white/[0.04]" />
    </div>
  );
}
