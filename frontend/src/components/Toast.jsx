import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  const context = useApp();
  const activeToast = message ? { message, type } : context.toast;
  const handleClose = onClose || context.hideToast;

  if (!activeToast || !activeToast.message) return null;

  const toastType = activeToast.type || "success";

  const typeConfig = {
    success: {
      borderColor: "border-[#BBF7D0]",
      bgBadge: "bg-[#DCFCE7] text-[#166534]",
      icon: CheckCircle2,
      iconColor: "text-[#16A34A]",
    },
    error: {
      borderColor: "border-[#FECACA]",
      bgBadge: "bg-[#FEE2E2] text-[#991B1B]",
      icon: AlertTriangle,
      iconColor: "text-[#DC2626]",
    },
    info: {
      borderColor: "border-[#BFDBFE]",
      bgBadge: "bg-[#DBEAFE] text-[#1E40AF]",
      icon: Info,
      iconColor: "text-[#2563EB]",
    },
  };

  const config = typeConfig[toastType] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90vw] sm:w-auto animate-bounce-in">
      <div
        className={`bg-surface border ${config.borderColor} shadow-xl rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3.5 text-ink transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${config.bgBadge} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-ink leading-tight">
            {activeToast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-full text-ink-muted hover:text-ink hover:bg-black/5 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
