export default function ListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading books">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ))}
    </div>
  );
}