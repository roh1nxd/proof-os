import type { ReactNode } from "react";

type Props = {
  type: "error" | "success" | "info";
  children: ReactNode;
};

const styles = {
  error: "border-red-900/80 bg-red-950/40 text-red-200",
  success: "border-emerald-900/80 bg-emerald-950/40 text-emerald-200",
  info: "border-zinc-700 bg-zinc-900/60 text-zinc-300",
};

export function AlertBanner({ type, children }: Props) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
