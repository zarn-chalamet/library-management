import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { useEscape } from '../hooks/useEscape';
import { validateBook } from '../utils/validation';

function inputClass(hasError) {
  return `w-full rounded-lg border px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:ring-4 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15'
  }`;
}

function Field({ id, label, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
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

// Keep only digits and X, uppercase, max 13 characters (hyphens and spaces are dropped)
const cleanIsbn = (value) => value.replace(/[^0-9Xx]/g, '').toUpperCase().slice(0, 13);

export default function BookFormModal({ book, genres, onSubmit, onClose }) {
  const isEdit = Boolean(book);
  const initial = useMemo(() => toForm(book), [book]);

  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEscape(() => {
    if (!submitting) onClose();
  });

  const errors = validateBook(form, isEdit);
  const isValid = Object.keys(errors).length === 0;
  // When editing, saving makes no sense until something has changed
  const isDirty = Object.keys(initial).some((key) => initial[key] !== form[key]);
  const canSubmit = isValid && (!isEdit || isDirty) && !submitting;

  // An error only shows after the user has left the field
  const fieldError = (name) => (touched[name] ? errors[name] : '');

  const set = (name, transform) => (e) => {
    const value = transform ? transform(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setError(''); // clear the server error as soon as the user edits
  };
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }));

  function fieldProps(name) {
    return {
      id: name,
      onBlur: blur(name),
      'aria-invalid': Boolean(fieldError(name)),
      'aria-describedby': `${name}-error`,
      className: inputClass(fieldError(name)),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn,
      genre: form.genre.trim(),
      publicationYear: Number(form.publicationYear),
      totalCopies: Number(form.totalCopies),
    };
    // A new book starts with every copy available (the API sets this), so only edits send it
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

        <form onSubmit={handleSubmit} noValidate className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2"
            >
              {error}
            </div>
          )}

          <Field id="title" label="Title" error={fieldError('title')} className="sm:col-span-2">
            <input {...fieldProps('title')} value={form.title} onChange={set('title')} autoFocus />
          </Field>

          <Field id="author" label="Author" error={fieldError('author')}>
            <input {...fieldProps('author')} value={form.author} onChange={set('author')} />
          </Field>

          <Field id="isbn" label="ISBN" error={fieldError('isbn')}>
            <input
              {...fieldProps('isbn')}
              value={form.isbn}
              onChange={set('isbn', cleanIsbn)}
              inputMode="numeric"
              placeholder="10 or 13 digits"
              maxLength={13}
            />
          </Field>

          <Field id="genre" label="Genre" error={fieldError('genre')}>
            <input {...fieldProps('genre')} value={form.genre} onChange={set('genre')} list="genre-options" />
            <datalist id="genre-options">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>

          <Field id="publicationYear" label="Publication year" error={fieldError('publicationYear')}>
            <input
              {...fieldProps('publicationYear')}
              type="number"
              value={form.publicationYear}
              onChange={set('publicationYear')}
            />
          </Field>

          <Field id="totalCopies" label="Total copies" error={fieldError('totalCopies')}>
            <input
              {...fieldProps('totalCopies')}
              type="number"
              min="0"
              value={form.totalCopies}
              onChange={set('totalCopies')}
            />
          </Field>

          {isEdit && (
            <Field id="availableCopies" label="Available copies" error={fieldError('availableCopies')}>
              <input
                {...fieldProps('availableCopies')}
                type="number"
                min="0"
                value={form.availableCopies}
                onChange={set('availableCopies')}
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
              disabled={!canSubmit}
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