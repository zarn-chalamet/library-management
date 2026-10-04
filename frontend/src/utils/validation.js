export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Used for the live checklist and the validation below
export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'number', label: 'Contains a number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Contains a special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function validateRegister({ username, email, password, confirm }) {
  const errors = {};

  if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';

  if (!email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';

  if (!password) errors.password = 'Password is required.';
  else if (!passwordRules.every((r) => r.test(password))) {
    errors.password = 'Password does not meet all the requirements.';
  }

  if (!confirm) errors.confirm = 'Please confirm your password.';
  else if (confirm !== password) errors.confirm = 'Passwords do not match.';

  return errors;
}

// ISBN-10 (the last character may be X) or ISBN-13, digits only
export const ISBN_RE = /^(\d{9}[\dX]|\d{13})$/;

function isWholeNumber(value) {
  return value !== '' && Number.isInteger(Number(value));
}

export function validateBook(form, isEdit) {
  const errors = {};

  const title = form.title.trim();
  if (!title) errors.title = 'Title is required.';
  else if (title.length > 200) errors.title = 'Title must be at most 200 characters.';

  const author = form.author.trim();
  if (!author) errors.author = 'Author is required.';
  else if (author.length > 150) errors.author = 'Author must be at most 150 characters.';

  if (!form.isbn) errors.isbn = 'ISBN is required.';
  else if (!ISBN_RE.test(form.isbn)) {
    errors.isbn = 'ISBN must be 10 or 13 characters (digits only; an ISBN-10 may end in X).';
  }

  const genre = form.genre.trim();
  if (!genre) errors.genre = 'Genre is required.';
  else if (genre.length > 50) errors.genre = 'Genre must be at most 50 characters.';

  const year = Number(form.publicationYear);
  if (!isWholeNumber(form.publicationYear) || year < 1000 || year > 2100) {
    errors.publicationYear = 'Enter a year between 1000 and 2100.';
  }

  const total = Number(form.totalCopies);
  const totalOk = isWholeNumber(form.totalCopies) && total >= 0 && total <= 10000;
  if (!totalOk) errors.totalCopies = 'Enter a whole number from 0 to 10000.';

  if (isEdit) {
    const available = Number(form.availableCopies);
    if (!isWholeNumber(form.availableCopies) || available < 0) {
      errors.availableCopies = 'Enter a whole number of 0 or more.';
    } else if (totalOk && available > total) {
      errors.availableCopies = `Cannot be more than total copies (${total}).`;
    }
  }

  return errors;
}