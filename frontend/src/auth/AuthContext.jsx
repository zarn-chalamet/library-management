import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login and register return the same payload: store it and sign the user in
  function saveSession(data) {
    localStorage.setItem('token', data.token);
    const profile = { email: data.email, username: data.username, role: data.role };
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  }

  async function login(email, password) {
    saveSession(await authApi.login({ email, password }));
  }

  async function register(username, email, password) {
    saveSession(await authApi.register({ username, email, password }));
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);