import { useEffect, useState } from 'react';
import { bookApi, getErrorMessage } from '../services/api';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    bookApi
      .getAll()
      .then((data) => !ignore && setBooks(data))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  async function reload() {
    setLoading(true);
    setError('');
    try {
      setBooks(await bookApi.getAll());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Latest copy of one book (used before editing)
  const getBook = (id) => bookApi.getById(id);

  async function createBook(payload) {
    const created = await bookApi.create(payload);
    setBooks((prev) => [created, ...prev]);
  }

  async function updateBook(id, payload) {
    const updated = await bookApi.update(id, payload);
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }

  async function deleteBook(id) {
    await bookApi.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return { books, loading, error, reload, getBook, createBook, updateBook, deleteBook };
}