import { useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { ok: <CheckCircle size={16} />, err: <XCircle size={16} />, inf: <Info size={16} /> };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-root">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icons[t.type]}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
