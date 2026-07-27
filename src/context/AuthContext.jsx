import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin } from '../api/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const info = localStorage.getItem('admin_info');
    if (token && info) {
      setAdmin(JSON.parse(info));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {

    try {
      const res = await adminLogin(email, password);
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_info', JSON.stringify(res.data.admin));
        setAdmin(res.data.admin);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (e) {
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
