"use client";

import Link from "next/link";

type Config = {
  sessionConfigured?: boolean;
  sessionHint?: string;
  arkivWriterConfigured?: boolean;
  relayerAddress?: string | null;
};

export function SetupChecklist({ config, wallet }: { config?: Config; wallet?: string | null }) {
  const steps = [
    {
      done: config?.sessionConfigured,
      title: "Session secret",
      desc: "npm run setup",
      href: "/setup",
    },
    {
      done: config?.arkivWriterConfigured,
      title: "Arkiv writer key",
      desc: "ARKIV_PRIVATE_KEY + GLM",
      href: "/setup",
    },
    {
      done: Boolean(wallet),
      title: "Wallet connected",
      desc: "SIWE sign-in",
      href: "/dashboard",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm uppercase">System status</h3>
        <span className="badge badge-muted">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="h-2 border-[2px] border-black mb-5 overflow-hidden bg-white">
        <div
          className="h-full bg-[#00f0ff] transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-3">
        {steps.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="flex items-center gap-3 p-2 -mx-2 hover:bg-[#ffe600] transition"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border-[2px] border-black text-xs font-black ${
                  s.done
                    ? "bg-[#b8ff00] text-black"
                    : "bg-[#ff006e] text-white"
                }`}
              >
                {s.done ? "✓" : "!"}
              </span>
              <div>
                <p className="text-sm font-black">{s.title}</p>
                <p className="text-xs font-bold opacity-70">{s.desc}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {config?.relayerAddress ? (
        <p className="mt-4 text-[10px] font-mono break-all border-t-[3px] border-black pt-3 opacity-60">
          Relayer {config.relayerAddress}
        </p>
      ) : null}
    </div>
  );
}
