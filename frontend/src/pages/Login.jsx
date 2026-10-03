import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, Check, Circle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../services/api';
import { passwordRules, validateLogin, validateRegister } from '../utils/validation';

const ENV_NAME = import.meta.env.VITE_ENV_NAME;
const isProduction = ENV_NAME === 'Production';

const emptyValues = { username: '', email: '', password: '', confirm: '' };

function inputClass(hasError) {
  return `w-full rounded-lg border px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:ring-4 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15'
  }`;
}

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
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

function PasswordChecklist({ password }) {
  // All requirements met -> hide the checklist
  if (passwordRules.every((rule) => rule.test(password))) return null;

  return (
    <ul className="grid gap-1 rounded-lg bg-slate-50 px-3 py-2.5" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition-colors ${
              ok ? 'font-medium text-emerald-600' : 'text-slate-500'
            }`}
          >
            {ok ? <Check size={14} /> : <Circle size={14} />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [values, setValues] = useState(emptyValues);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  // Already logged in -> skip the login page
  if (user) return <Navigate to="/dashboard" replace />;

  const errors = isRegister ? validateRegister(values) : validateLogin(values);
  const isValid = Object.keys(errors).length === 0;
  // An error only shows after the user has left the field
  const fieldError = (name) => (touched[name] ? errors[name] : '');

  const onChange = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setError(''); // clear the server error as soon as the user edits
  };
  const onBlur = (name) => () => setTouched((t) => ({ ...t, [name]: true }));

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setValues(emptyValues);
    setTouched({});
    setError('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      // Reveal every error at once
      setTouched({ username: true, email: true, password: true, confirm: true });
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(values.username.trim(), values.email.trim(), values.password);
      } else {
        await login(values.email.trim(), values.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-100 to-sky-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 pb-8 pt-10 shadow-xl shadow-slate-900/5">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-white">
            <BookOpen size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Library System</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister ? 'Create an account to browse the collection' : 'Sign in to manage the book collection'}
          </p>

          {!isProduction && ENV_NAME && (
            <span className="mt-3 inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
              {ENV_NAME}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {isRegister && (
            <Field id="username" label="Username" error={fieldError('username')}>
              <input
                id="username"
                type="text"
                value={values.username}
                onChange={onChange('username')}
                onBlur={onBlur('username')}
                placeholder="Your name"
                autoComplete="username"
                aria-invalid={Boolean(fieldError('username'))}
                aria-describedby="username-error"
                className={inputClass(fieldError('username'))}
              />
            </Field>
          )}

          <Field id="email" label="Email" error={fieldError('email')}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={onChange('email')}
              onBlur={onBlur('email')}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldError('email'))}
              aria-describedby="email-error"
              className={inputClass(fieldError('email'))}
            />
          </Field>

          <Field
            id="password"
            label="Password"
            // In register mode the checklist explains what is missing, so only show text for an empty field
            error={isRegister && values.password ? '' : fieldError('password')}
          >
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={onChange('password')}
                onBlur={onBlur('password')}
                placeholder={isRegister ? 'Create a password' : 'Your password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                aria-invalid={Boolean(fieldError('password'))}
                aria-describedby="password-error"
                className={`${inputClass(fieldError('password'))} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {isRegister && (touched.password || values.password) && <PasswordChecklist password={values.password} />}
          </Field>

          {isRegister && (
            <Field id="confirm" label="Confirm password" error={fieldError('confirm')}>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={values.confirm}
                onChange={onChange('confirm')}
                onBlur={onBlur('confirm')}
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-invalid={Boolean(fieldError('confirm'))}
                aria-describedby="confirm-error"
                className={inputClass(fieldError('confirm'))}
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            )}
            {loading
              ? isRegister
                ? 'Creating account...'
                : 'Signing in...'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>

        {!isProduction && !isRegister && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Demo admin:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">admin@library.com</code> /{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">Admin@123</code>
          </p>
        )}
      </div>
    </main>
  );
}