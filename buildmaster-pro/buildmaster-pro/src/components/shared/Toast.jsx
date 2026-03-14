import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

// Toast Context for global toast management
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 md:right-auto z-50 space-y-2 md:space-y-2 md:w-72">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Single Toast Item
const ToastItem = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  };

  return (
    <div
      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg border transition-all duration-300 ${colors[type]} ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      {icons[type]}
      <span className="text-white text-sm md:text-base flex-1">{message}</span>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="mr-1 md:mr-2 hover:opacity-70 p-1">
        <X className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </div>
  );
};

export default ToastItem;
