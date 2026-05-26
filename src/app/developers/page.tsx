"use client";

import Link from "next/link";
import { useState } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api/client-fetch";

const BASE = "/api/v1";

const endpoints = [
  { method: "GET", path: `${BASE}/builders/{wallet}`, desc: "Full builder payload from Arkiv" },
  { method: "GET", path: `${BASE}/profiles/{slug}`, desc: "Profile by public slug" },
  { method: "GET", path: `${BASE}/reputation/{wallet}`, desc: "Trust score + breakdown" },
  { method: "GET", path: `${BASE}/contributions/{wallet}`, desc: "Contribution proofs" },
  { method: "GET", path: `${BASE}/endorsements/{wallet}`, desc: "Endorsements received" },
  { method: "POST", path: `${BASE}/verify`, desc: "Verify min score threshold" },
];

export default function DevelopersPage() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tryApi = async () => {
    if (!wallet.startsWith("0x")) {
      setResult("Enter a valid wallet address");
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await apiFetch<{ reputation: { score: number } }>(
      `${BASE}/reputation/${encodeURIComponent(wallet)}`,
    );
    setLoading(false);
    if (res.ok) {
      setResult(`Score: ${res.data.reputation.score} / 100`);
    } else {
      setResult(res.body.error ?? "Request failed");
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
      <span className="badge badge-success">Public API v1</span>
      <h1 className="mt-4 text-3xl md:text-4xl font-black uppercase">Developer docs</h1>
      <p className="mt-3 font-bold leading-relaxed opacity-75">
        CORS-enabled REST. All data from{" "}
        <a
          href="https://docs.arkiv.network/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-black"
        >
          Arkiv
        </a>{" "}
        Braga entities.
      </p>

      <div className="mt-10 card p-6 space-y-4">
        <h2 className="font-black uppercase">Live API tester</h2>
        <div className="flex gap-2">
          <input
            className="input flex-1 font-mono text-xs"
            placeholder="0x wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary shrink-0"
            disabled={loading}
            onClick={() => void tryApi()}
          >
            {loading ? <Spinner /> : "Test"}
          </button>
        </div>
        {result ? (
          <p className="text-sm font-mono font-bold card px-3 py-2">
            {result}
          </p>
        ) : null}
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="font-black text-lg uppercase">Endpoints</h2>
        {endpoints.map((ep) => {
          const full = `${origin}${ep.path}`;
          return (
            <div key={ep.path} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-success">{ep.method}</span>
                <CopyButton text={full} label="Copy URL" />
              </div>
              <code className="mt-2 block text-sm break-all font-bold">{ep.path}</code>
              <p className="mt-2 text-xs font-bold opacity-70">{ep.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 card p-6 font-mono text-xs overflow-x-auto">
        <p className="font-sans font-black text-sm mb-3 uppercase">Example</p>
        <pre className="font-bold">{`const res = await fetch(
  "${origin}${BASE}/reputation/0xYOUR_WALLET"
);
const { ok, data } = await res.json();
console.log(data.reputation.score);`}</pre>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/api/v1/openapi.json" className="underline font-black">
          OpenAPI JSON →
        </Link>
        <Link href="/api/status" className="underline font-black">
          System status →
        </Link>
      </div>
    </main>
  );
}
