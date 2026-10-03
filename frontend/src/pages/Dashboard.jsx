import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../services/api';
import { useBooks } from '../hooks/useBooks';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import Toolbar from '../components/Toolbar';
import BookList from '../components/BookList';
import BookFormModal from '../components/BookFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import BookDetailModal from '../components/BookDetailModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user.role === 'Admin';

  const { books, loading, error, reload, getBook, createBook, updateBook, deleteBook } = useBooks();

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [modal, setModal] = useState(null); // { book: Book | null } while open
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detail, setDetail] = useState(null);

  const genres = useMemo(() => [...new Set(books.map((b) => b.genre))].sort(), [books]);

  // If the selected genre disappears (e.g. its last book was deleted), fall back to "all"
  const activeGenre = genres.includes(genre) ? genre : 'all';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      const matchesGenre = activeGenre === 'all' || b.genre === activeGenre;
      const matchesSearch =
        !q || [b.title, b.author, b.isbn].some((value) => value.toLowerCase().includes(q));
      return matchesGenre && matchesSearch;
    });
  }, [books, search, activeGenre]);

  // fetch and show the latest copy of the book
  async function handleView(book) {
    try {
      setDetail(await getBook(book.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
      if (err.response?.status === 404) reload();// when it is deleted by another user, refresh the list so the user sees it disappear
    }
  }

  // Fetch the latest copy before editing, so the form never starts from stale data
  async function handleEdit(book) {
    try {
      const latest = await getBook(book.id);
      setModal({ book: latest });
    } catch (err) {
      toast.error(getErrorMessage(err));
      if (err.response?.status === 404) reload(); // when it is deleted by another user, refresh the list so the user sees it disappear
    }
  }

  async function handleSave(payload) {
    if (modal.book) {
      await updateBook(modal.book.id, payload);
      toast.success('Book updated');
    } else {
      await createBook(payload);
      toast.success('Book added');
    }
    setModal(null);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteBook(toDelete.id);
      toast.success(`"${toDelete.title}" deleted`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const addButton = isAdmin && (
    <button
      type="button"
      onClick={() => setModal({ book: null })}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
    >
      <Plus size={16} />
      Add book
    </button>
  );

  function renderContent() {
    if (loading) return <ListSkeleton />;

    if (error) {
      return (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <EmptyState
          title="No books yet"
          text={isAdmin ? 'Add the first book to the collection.' : 'The collection is empty.'}
          action={addButton}
        />
      );
    }

    if (filtered.length === 0) {
      return <EmptyState title="No matching books" text="Try a different search or genre." />;
    }

    return <BookList books={filtered} isAdmin={isAdmin} onView={handleView} onEdit={handleEdit} onDelete={setToDelete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={logout} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Book inventory</h2>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? 'Browse, add, edit and remove books.'
              : 'You have read-only access. Ask an admin to change the collection.'}
          </p>
        </div>

        {!loading && !error && <StatsCards books={books} />}

        <Toolbar
          search={search}
          onSearch={setSearch}
          genre={activeGenre}
          onGenre={setGenre}
          genres={genres}
          canAdd={isAdmin}
          onAdd={() => setModal({ book: null })}
        />

        {!loading && !error && books.length > 0 && (
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {books.length} {books.length === 1 ? 'book' : 'books'}
          </p>
        )}

        {renderContent()}
      </main>

      {modal && (
        <BookFormModal
          key={modal.book?.id ?? 'new'}
          book={modal.book}
          genres={genres}
          onSubmit={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this book?"
          message={`"${toDelete.title}" will be permanently removed.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {detail && (
        <BookDetailModal
          book={detail}
          canEdit={isAdmin}
          onEdit={() => {
            const book = detail;
            setDetail(null);
            handleEdit(book);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}