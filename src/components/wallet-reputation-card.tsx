"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api/client-fetch";

type ReputationData = {
  wallet: string;
  reputation: {
    score: number;
    maxScore: number;
    breakdown: Record<string, number>;
    counts: Record<string, number>;
  };
  profile: { slug: string | null; displayName: string } | null;
};

export function WalletReputationCard({ wallet }: { wallet: string }) {
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const res = await apiFetch<ReputationData>(
        `/api/reputation/${encodeURIComponent(wallet)}`,
      );
      if (res.ok) setData(res.data);
      setLoading(false);
    })();
  }, [wallet]);

  if (loading) {
    return <div className="card h-48 animate-pulse" />;
  }

  if (!data) return null;

  const pct = Math.round((data.reputation.score / data.reputation.maxScore) * 100);

  return (
    <div className="card-glow p-6">
      <p className="text-xs font-black uppercase tracking-wider">
        Trust score
      </p>
      <div className="mt-4 flex items-center gap-5">
        <div
          className="score-ring relative flex h-20 w-20 shrink-0 items-center justify-center"
          style={{ "--pct": pct } as CSSProperties}
        >
          <div className="absolute inset-1.5 flex items-center justify-center bg-white border-2 border-black">
            <span className="text-2xl font-black">{data.reputation.score}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">out of {data.reputation.maxScore}</p>
          {data.profile?.slug ? (
            <Link
              href={`/${data.profile.slug}`}
              className="mt-2 inline-block text-sm font-black underline"
            >
              View public profile →
            </Link>
          ) : (
            <p className="mt-2 text-xs font-bold">Create a profile to boost score</p>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { k: "contributions", label: "Proofs" },
          { k: "endorsementsReceived", label: "Endorse" },
          { k: "badges", label: "Badges" },
        ].map(({ k, label }) => (
          <div key={k} className="card py-2 text-center">
            <p className="text-lg font-black">
              {data.reputation.counts[k as keyof typeof data.reputation.counts] ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-wide font-bold">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
