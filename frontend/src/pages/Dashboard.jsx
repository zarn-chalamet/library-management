import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <p className="text-slate-700">
        Hello {user.username} ({user.role})
      </p>
      <button
        onClick={logout}
        className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
      >
        Logout
      </button>
    </div>
  );
}