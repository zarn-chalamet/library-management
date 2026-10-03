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