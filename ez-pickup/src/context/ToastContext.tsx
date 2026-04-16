import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ToastOptions {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // ms before auto-dismiss, default 3000
}

interface ToastContextValue {
  addToast: (options: ToastOptions) => void;
}

// ---------------------------------------------------------------------------
// Internal toast item shape
// ---------------------------------------------------------------------------

interface ToastItem extends Required<ToastOptions> {
  id: string;
  visible: boolean; // drives CSS enter/exit transition
}

// ---------------------------------------------------------------------------
// Context + hook
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider (owns state and renders the toast container)
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const removeToast = useCallback((id: string) => {
    // Trigger exit transition first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    );
    // Remove from DOM after transition completes (300 ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${++counter.current}`;
      const item: ToastItem = {
        id,
        type: options.type,
        message: options.message,
        duration: options.duration ?? 3000,
        visible: false, // start invisible for enter transition
      };

      setToasts((prev) => [...prev, item]);

      // Flip visible on next tick so the CSS transition fires
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t)),
        );
      }, 10);

      // Auto-dismiss after duration
      setTimeout(() => removeToast(id), item.duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* ── Toast container ── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2 items-end pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={[
              // layout
              'pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg',
              'text-sm font-medium max-w-xs',
              // transition
              'transition-all duration-300',
              toast.visible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3',
              // colour per type
              toast.type === 'success' && 'bg-green-600 text-white',
              toast.type === 'error'   && 'bg-red-600   text-white',
              toast.type === 'info'    && 'bg-slate-700 text-white',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {toast.type === 'success' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
