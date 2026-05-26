"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrutalLogo } from "@/components/brutal/logo";
import { apiFetch } from "@/lib/api/client-fetch";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/developers", label: "API" },
  { href: "/setup", label: "Setup" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [wallet, setWallet] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void apiFetch<{ authenticated: boolean; wallet: string | null }>("/api/auth/me").then(
      (res) => {
        if (res.ok && res.data.authenticated) setWallet(res.data.wallet);
        else setWallet(null);
      },
    );
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const short = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : null;

  return (
    <>
      <div className="brutal-stripe" />
      <header className="sticky top-0 z-50 bg-white border-b-[3px] border-black">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrutalLogo />

          {/* Desktop nav — full links, no hamburger */}
          <nav className="hidden lg:flex items-center gap-0 flex-1 justify-center">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-[3px] border-black -ml-[3px] first:ml-0 transition-colors ${
                    active
                      ? "bg-[#00f0ff] shadow-[3px_3px_0_#0a0a0a]"
                      : "bg-white hover:bg-[#ffe600]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop connect */}
          <div className="hidden lg:flex items-center shrink-0">
            {short ? (
              <Link
                href="/dashboard"
                className="btn btn-sm bg-[#b8ff00] font-mono normal-case tracking-normal"
              >
                {short}
              </Link>
            ) : (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Connect
              </Link>
            )}
          </div>

          {/* Mobile / tablet: connect + hamburger only */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {!menuOpen && short ? (
              <Link
                href="/dashboard"
                className="btn btn-sm bg-[#b8ff00] font-mono text-[10px] normal-case px-2"
              >
                {short}
              </Link>
            ) : null}

            <button
              type="button"
              className="hamburger lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <>
                  <span className="rotate-45 translate-y-[8px]" />
                  <span className="opacity-0" />
                  <span className="-rotate-45 -translate-y-[8px]" />
                </>
              ) : (
                <>
                  <span />
                  <span />
                  <span />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen ? (
          <nav className="lg:hidden border-t-[3px] border-black bg-[#ffe600] px-4 py-4 flex flex-col gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="btn btn-secondary w-full justify-start normal-case tracking-normal font-bold"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dashboard" className="btn btn-primary w-full mt-1">
              {short ? "Dashboard" : "Connect wallet"}
            </Link>
          </nav>
        ) : null}
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-black mt-auto bg-black text-white">
      <div className="brutal-stripe" />
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider">
        <p>
          Proof<span className="text-[#00f0ff]">OS</span> × Arkiv
        </p>
        <div className="flex gap-4">
          <a
            href="https://docs.arkiv.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#b8ff00]"
          >
            Arkiv
          </a>
          <Link href="/developers" className="hover:text-[#ff006e]">
            API
          </Link>
        </div>
      </div>
    </footer>
  );
}
