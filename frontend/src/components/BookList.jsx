import { Pencil, Trash2 } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

function RowActions({ book, onEdit, onDelete }) {
  return (
    // stopPropagation: clicking an action must not also open the detail modal
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onEdit(book)}
        aria-label={`Edit ${book.title}`}
        title="Edit"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
      >
        <Pencil size={18} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(book)}
        aria-label={`Delete ${book.title}`}
        title="Delete"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// The button has no handler of its own: its click bubbles up to the row/card, which opens the detail.
// It is there so keyboard users can reach the book with Tab and open it with Enter.
function TitleButton({ title }) {
  return (
    <button
      type="button"
      className="text-left font-semibold text-slate-900 hover:text-indigo-600 focus-visible:text-indigo-600"
    >
      {title}
    </button>
  );
}

export default function BookList({ books, isAdmin, onView, onEdit, onDelete }) {
  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Author</th>
              <th className="px-4 py-3 font-semibold">Genre</th>
              <th className="px-4 py-3 font-semibold">Year</th>
              <th className="px-4 py-3 font-semibold">Copies</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {isAdmin && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((b) => (
              <tr
                key={b.id}
                onClick={() => onView(b)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <TitleButton title={b.title} />
                  <p className="text-xs text-slate-500">ISBN {b.isbn}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{b.author}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {b.genre}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{b.publicationYear}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {b.availableCopies} / {b.totalCopies}
                </td>
                <td className="px-4 py-3">
                  <AvailabilityBadge available={b.isAvailable} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <RowActions book={b} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {books.map((b) => (
          <li
            key={b.id}
            onClick={() => onView(b)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <TitleButton title={b.title} />
                <p className="text-sm text-slate-600">{b.author}</p>
              </div>
              <AvailabilityBadge available={b.isAvailable} />
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-500">Genre</dt>
                <dd className="font-medium text-slate-800">{b.genre}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Year</dt>
                <dd className="font-medium text-slate-800">{b.publicationYear}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Copies</dt>
                <dd className="font-medium tabular-nums text-slate-800">
                  {b.availableCopies} / {b.totalCopies}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-slate-500">ISBN {b.isbn}</p>

            {isAdmin && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <RowActions book={b} onEdit={onEdit} onDelete={onDelete} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}