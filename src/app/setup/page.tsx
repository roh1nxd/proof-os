import Link from "next/link";
import type { ReactNode } from "react";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-16">
      <span className="badge badge-warning">Required once</span>
      <h1 className="mt-4 text-3xl md:text-4xl font-black uppercase">Setup ProofOS</h1>
      <p className="mt-3 font-bold opacity-75">
        Put secrets in <code className="text-emerald-400/90">.env.local</code> only — not{" "}
        <code className="text-slate-400">.env.example</code>. Run{" "}
        <code className="text-emerald-400/90">npm run env:check</code> to verify.
      </p>

      <div className="mt-10 space-y-5">
        <StepCard
          n={1}
          title="SESSION_SECRET"
          highlight="You generate this — it doesn't exist anywhere else"
        >
          <p>Random string (32+ chars) for encrypted login cookies.</p>
          <pre className="mt-3 card p-4 text-sm font-black">
            npm run setup
          </pre>
        </StepCard>

        <StepCard n={2} title="ARKIV_PRIVATE_KEY">
          <ol className="list-decimal pl-5 space-y-2 font-bold opacity-80">
            <li>Create a new test wallet in MetaMask</li>
            <li>Export private key → paste in .env.local</li>
            <li>Works with or without 0x prefix</li>
            <li>
              Fund with Braga GLM from{" "}
              <a
                href="https://docs.arkiv.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-black"
              >
                Arkiv faucet
              </a>
            </li>
          </ol>
        </StepCard>

        <StepCard n={3} title="NEXT_PUBLIC_APP_URL">
          <pre className="card p-3 text-sm font-black">
            NEXT_PUBLIC_APP_URL=http://localhost:3000
          </pre>
          <p className="mt-2 text-sm font-bold">
            Don&apos;t mix localhost and 127.0.0.1 when signing in.
          </p>
        </StepCard>

        <StepCard n={4} title="Launch">
          <pre className="card p-3 text-sm font-black">
            npm run dev
          </pre>
          <Link href="/dashboard" className="btn btn-primary mt-4 inline-flex">
            Open dashboard →
          </Link>
        </StepCard>
      </div>
    </main>
  );
}

function StepCard({
  n,
  title,
  highlight,
  children,
}: {
  n: number;
  title: string;
  highlight?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center border-[3px] border-black bg-[#00f0ff] text-sm font-black shadow-[3px_3px_0_#0a0a0a]">
          {n}
        </span>
        <h2 className="text-lg font-black uppercase">{title}</h2>
      </div>
      {highlight ? (
        <p className="mt-3 text-sm font-bold border-l-[3px] border-black pl-3">
          {highlight}
        </p>
      ) : null}
      <div className="mt-4 text-sm space-y-2">{children}</div>
    </div>
  );
}
