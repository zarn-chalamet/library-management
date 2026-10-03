import { BookOpen, LogOut } from 'lucide-react';

const ENV_NAME = import.meta.env.VITE_ENV_NAME;
const isProduction = ENV_NAME === 'Production';

export default function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <BookOpen size={18} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900">Library System</h1>
            {ENV_NAME && !isProduction && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {ENV_NAME}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">{user.username}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700">
            {user.username.charAt(0)}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}