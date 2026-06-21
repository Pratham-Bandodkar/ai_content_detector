import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container on screen */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  const { message, type } = toast;
  
  const styles = {
    success: {
      bg: 'bg-[#121826]/90 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      glow: 'bg-emerald-500/10'
    },
    error: {
      bg: 'bg-[#121826]/90 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      glow: 'bg-rose-500/10'
    },
    warning: {
      bg: 'bg-[#121826]/90 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      glow: 'bg-amber-500/10'
    },
    info: {
      bg: 'bg-[#121826]/90 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      glow: 'bg-blue-500/10'
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`pointer-events-auto relative flex items-center justify-between border rounded-xl p-4 backdrop-blur-xl ${currentStyle.bg} overflow-hidden`}
    >
      {/* Background neon tint glow */}
      <div className={`absolute -left-10 -top-10 w-24 h-24 rounded-full blur-2xl ${currentStyle.glow}`} />

      <div className="flex items-center gap-3 relative z-10">
        {currentStyle.icon}
        <span className="text-xs font-semibold text-gray-200 leading-snug">
          {message}
        </span>
      </div>

      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors ml-4 relative z-10"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
