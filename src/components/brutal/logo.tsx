import Link from "next/link";

export function BrutalLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className={`relative ${box} shrink-0`}>
        <span
          className="absolute inset-0 bg-[#ff006e] border-[3px] border-black translate-x-0.5 translate-y-0.5"
          aria-hidden
        />
        <span className="absolute inset-0 bg-[#00f0ff] border-[3px] border-black flex items-center justify-center font-black">
          P
        </span>
      </div>
      <div className="leading-none">
        <span className="block font-black text-lg tracking-tighter uppercase">
          Proof<span className="text-[#ff006e]">OS</span>
        </span>
        <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.2em] text-black/50">
          Arkiv identity
        </span>
      </div>
    </Link>
  );
}
