"use client";

import React from "react";
import { useVDRStore, ToastItem } from "@/store/useVDRStore";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToastContainer: React.FC = () => {
  const toasts = useVDRStore((state) => state.toasts);
  const removeToast = useVDRStore((state) => state.removeToast);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-sev-1 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-accent shrink-0" />,
  };

  const borderMap = {
    success: "border-success/30 bg-white/95 dark:bg-slate-900/95 shadow-success/5",
    error: "border-sev-1/30 bg-white/95 dark:bg-slate-900/95 shadow-sev-1/5",
    warning: "border-amber-500/30 bg-white/95 dark:bg-slate-900/95 shadow-amber-500/5",
    info: "border-accent/30 bg-white/95 dark:bg-slate-900/95 shadow-accent/5",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0",
        borderMap[toast.type]
      )}
    >
      <div className="mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
          {toast.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
