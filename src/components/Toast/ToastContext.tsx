"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Standalone toast triggers via custom events
export const appToast = {
  success: (message: string, duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message, type: "success", duration },
        })
      );
    }
  },
  error: (message: string, duration = 5000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message, type: "error", duration },
        })
      );
    }
  },
  info: (message: string, duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message, type: "info", duration },
        })
      );
    }
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        type?: ToastType;
        duration?: number;
      }>;
      if (customEvent.detail && customEvent.detail.message) {
        showToast(
          customEvent.detail.message,
          customEvent.detail.type || "info",
          customEvent.detail.duration || 4000
        );
      }
    };

    window.addEventListener("app:toast", handleCustomToast);
    return () => {
      window.removeEventListener("app:toast", handleCustomToast);
    };
  }, [showToast]);

  const toastMethods = {
    success: (msg: string, dur?: number) => showToast(msg, "success", dur),
    error: (msg: string, dur?: number) => showToast(msg, "error", dur),
    info: (msg: string, dur?: number) => showToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast: toastMethods }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-top duration-200 ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700"
                : t.type === "error"
                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-700"
                : "bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-700"
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && (
                <svg
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {t.type === "error" && (
                <svg
                  className="w-5 h-5 text-rose-600 dark:text-rose-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {t.type === "info" && (
                <svg
                  className="w-5 h-5 text-sky-600 dark:text-sky-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1 break-words leading-snug">{t.message}</div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: appToast.info,
      toast: appToast,
    };
  }
  return context;
};
