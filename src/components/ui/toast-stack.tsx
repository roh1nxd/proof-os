"use client";

import type { Toast } from "@/hooks/use-toast";

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter pointer-events-auto card px-4 py-3 flex items-start justify-between gap-3 ${
            t.type === "success"
              ? "card-lime"
              : t.type === "error"
                ? "card-magenta"
                : ""
          }`}
        >
          <p
            className={`text-sm font-bold ${
              t.type === "success"
                ? "text-black"
                : t.type === "error"
                  ? "text-white"
                  : "text-black"
            }`}
          >
            {t.message}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className={`text-lg leading-none font-black ${
              t.type === "error"
                ? "text-white/80 hover:text-white"
                : "text-black/50 hover:text-black"
            }`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
