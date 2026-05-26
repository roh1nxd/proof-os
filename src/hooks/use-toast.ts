"use client";

import { useCallback, useState } from "react";

export type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type: Toast["type"], message: string) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  return { toasts, success: (m: string) => push("success", m), error: (m: string) => push("error", m), info: (m: string) => push("info", m), dismiss };
}
