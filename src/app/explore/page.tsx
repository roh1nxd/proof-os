"use client";

import Link from "next/link";
import { useState } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api/client-fetch";

type BuilderData = {
  wallet: string;
  slug?: string;
  reputation?: { score: number; maxScore?: number };
  profile?: { slug: string | null; displayName: string } | null;
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuilderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const isWallet = q.startsWith("0x");
    const path = isWallet
      ? `/api/v1/builders/${encodeURIComponent(q)}`
      : `/api/v1/profiles/${encodeURIComponent(q)}`;

    const res = await apiFetch<BuilderData>(path);
    setLoading(false);

    if (res.ok) {
      setResult(res.data);
    } else {
      setError(res.body.error ?? "Builder not found on Arkiv");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-black uppercase">
        Explore <span className="text-[#ff006e]">builders</span>
      </h1>
      <p className="mt-2 font-bold opacity-70">
        Search by wallet or profile slug — powered by Arkiv.
      </p>

      <div className="mt-8 card p-2 flex gap-2">
        <input
          className="input border-0 bg-transparent focus:shadow-none flex-1 font-bold"
          placeholder="0x… or slug"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void search()}
        />
        <button
          type="button"
          className="btn btn-primary shrink-0"
          disabled={loading || !query.trim()}
          onClick={() => void search()}
        >
          {loading ? <Spinner /> : "Search"}
        </button>
      </div>

      {error ? (
        <div className="mt-6 card card-magenta px-4 py-3 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="card-glow mt-8 p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-70">Trust score</p>
              <p className="text-5xl font-black mt-1">
                {result.reputation?.score ?? 0}
              </p>
            </div>
            {result.profile?.slug ? (
              <Link href={`/${result.profile.slug}`} className="btn btn-primary btn-sm">
                View profile →
              </Link>
            ) : null}
          </div>

          {result.profile ? (
            <div>
              <p className="text-xl font-black">{result.profile.displayName}</p>
              {result.profile.slug ? (
                <p className="text-sm font-mono font-bold">/{result.profile.slug}</p>
              ) : null}
            </div>
          ) : null}

          <div className="card p-3">
            <p className="text-xs font-bold mb-1">Wallet</p>
            <p className="font-mono text-xs break-all">{result.wallet}</p>
            <div className="mt-2">
              <CopyButton text={result.wallet} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
