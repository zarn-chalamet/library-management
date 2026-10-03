import { Pencil, X } from 'lucide-react';
import { useEscape } from '../hooks/useEscape';
import AvailabilityBadge from './AvailabilityBadge';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

export default function BookDetailModal({ book, canEdit, onEdit, onClose }) {
  useEscape(onClose);

  const percent = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2 id="book-detail-title" className="text-lg font-bold text-slate-900">
              {book.title}
            </h2>
            <p className="text-sm text-slate-600">by {book.author}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <AvailabilityBadge available={book.isAvailable} />

          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-semibold text-slate-700">Copies available</span>
              <span className="tabular-nums text-slate-600">
                {book.availableCopies} of {book.totalCopies}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${book.isAvailable ? 'bg-emerald-500' : 'bg-red-400'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <Detail label="Genre">{book.genre}</Detail>
            <Detail label="Publication year">{book.publicationYear}</Detail>
            <Detail label="ISBN">{book.isbn}</Detail>
          </dl>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}