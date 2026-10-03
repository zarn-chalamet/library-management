export default function StatsCards({ books }) {
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const outOfStock = books.filter((b) => !b.isAvailable).length;

  const stats = [
    { label: 'Titles', value: books.length, tone: 'text-slate-900' },
    { label: 'Total copies', value: totalCopies, tone: 'text-slate-900' },
    { label: 'Available copies', value: availableCopies, tone: 'text-emerald-600' },
    { label: 'Out of stock', value: outOfStock, tone: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${s.tone}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}