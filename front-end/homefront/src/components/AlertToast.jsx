import React, { useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const icons = {
  success: CheckCircleIcon,
  error: ExclamationTriangleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: "from-emerald-500 to-emerald-600 border-emerald-200 text-emerald-900",
  error: "from-rose-500 to-rose-600 border-rose-200 text-rose-900",
  warning: "from-amber-400 to-amber-500 border-amber-200 text-amber-900",
  info: "from-sky-500 to-sky-600 border-sky-200 text-sky-900",
};

const AlertToast = ({ toast, onClose }) => {
  const activeToast = toast && toast.message ? toast : null;
  const { type = "info", title, message } = activeToast || {};

  useEffect(() => {
    if (!onClose || !activeToast) return;
    const timeout = setTimeout(() => onClose(), 4500);
    return () => clearTimeout(timeout);
  }, [onClose, activeToast]);

  if (!activeToast) {
    return null;
  }

  const Icon = icons[type] || InformationCircleIcon;
  const colorClass = colors[type] || colors.info;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
      <div
        className={`overflow-hidden rounded-3xl border p-4 shadow-2xl ring-1 ring-black/5 bg-white ${colorClass}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            {title && <p className="font-semibold text-base mb-1">{title}</p>}
            <p className="text-sm leading-6 opacity-95">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/95 hover:bg-white/10"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertToast;
