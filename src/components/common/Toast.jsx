import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../utils/cn.js";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { variant = "success", duration = 2500 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 sm:bottom-6 sm:items-end sm:pr-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-sm shadow-md",
              )}
            >
              {toast.variant === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Info className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
