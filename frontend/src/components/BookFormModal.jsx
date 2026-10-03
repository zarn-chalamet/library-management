import { useState } from 'react';
import { X } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { useEscape } from '../hooks/useEscape';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';

function Field({ label, className = '', children }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function toForm(book) {
  if (!book) {
    return {
      title: '',
      author: '',
      isbn: '',
      genre: '',
      publicationYear: String(new Date().getFullYear()),
      totalCopies: '1',
      availableCopies: '1',
    };
  }
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    genre: book.genre,
    publicationYear: String(book.publicationYear),
    totalCopies: String(book.totalCopies),
    availableCopies: String(book.availableCopies),
  };
}

// Mirrors the backend rules so the user gets instant feedback
function validate(form, isEdit) {
  const year = Number(form.publicationYear);
  const total = Number(form.totalCopies);
  const available = Number(form.availableCopies);

  if (!Number.isInteger(year) || year < 1000 || year > 2100) {
    return 'Publication year must be between 1000 and 2100.';
  }
  if (!Number.isInteger(total) || total < 0) {
    return 'Total copies must be 0 or more.';
  }
  if (isEdit && (!Number.isInteger(available) || available < 0 || available > total)) {
    return 'Available copies must be between 0 and total copies.';
  }
  return '';
}

export default function BookFormModal({ book, genres, onSubmit, onClose }) {
  const isEdit = Boolean(book);
  const [form, setForm] = useState(() => toForm(book));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEscape(() => {
    if (!submitting) onClose();
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();

    const problem = validate(form, isEdit);
    if (problem) {
      setError(problem);
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      genre: form.genre.trim(),
      publicationYear: Number(form.publicationYear),
      totalCopies: Number(form.totalCopies),
    };
    // new book starts with every copy available (the API sets this), so only edits send it
    if (isEdit) payload.availableCopies = Number(form.availableCopies);

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(payload); // the parent closes the modal on success
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="book-modal-title" className="text-lg font-bold text-slate-900">
            {isEdit ? 'Edit book' : 'Add book'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2"
            >
              {error}
            </div>
          )}

          <Field label="Title" className="sm:col-span-2">
            <input className={inputClass} value={form.title} onChange={set('title')} required autoFocus />
          </Field>

          <Field label="Author">
            <input className={inputClass} value={form.author} onChange={set('author')} required />
          </Field>

          <Field label="ISBN">
            <input className={inputClass} value={form.isbn} onChange={set('isbn')} required />
          </Field>

          <Field label="Genre">
            <input className={inputClass} value={form.genre} onChange={set('genre')} list="genre-options" required />
            <datalist id="genre-options">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>

          <Field label="Publication year">
            <input
              type="number"
              className={inputClass}
              value={form.publicationYear}
              onChange={set('publicationYear')}
              required
            />
          </Field>

          <Field label="Total copies">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.totalCopies}
              onChange={set('totalCopies')}
              required
            />
          </Field>

          {isEdit && (
            <Field label="Available copies">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.availableCopies}
                onChange={set('availableCopies')}
                required
              />
            </Field>
          )}

          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}