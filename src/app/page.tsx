import Link from "next/link";

const stats = [
  { label: "Storage", value: "Arkiv", sub: "Braga DB-chain" },
  { label: "API", value: "v1", sub: "CORS-ready REST" },
  { label: "Auth", value: "SIWE", sub: "Wallet-native" },
];

const features = [
  {
    icon: "⛓",
    title: "On-chain proofs",
    desc: "Profiles, contributions, endorsements stored as Arkiv entities — queryable and tamper-proof.",
  },
  {
    icon: "⚡",
    title: "Trust engine",
    desc: "Transparent reputation score from real work — contributions, endorsements, badges.",
  },
  {
    icon: "🔌",
    title: "Public API",
    desc: "Drop ProofOS into DAOs, hiring platforms, grant tools. One fetch, full builder credibility.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-24 md:pt-24">
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="badge badge-success">
            <span className="pulse-dot" />
            Live on Arkiv Braga
          </span>
          <span className="badge badge-warning">Proof-of-work identity</span>
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
          Your reputation.
          <br />
          <span className="text-gradient">Verifiable. Portable. Yours.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed font-bold opacity-80">
          ProofOS is the credibility layer for builders — one profile, on-chain proofs,
          and an API any product can integrate in minutes.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Launch dashboard →
          </Link>
          <Link href="/explore" className="btn btn-secondary btn-lg">
            Explore builders
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg">
          {stats.map((s) => (
            <div key={s.label} className="card card-yellow px-4 py-3 text-center">
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-bold mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 group"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-black uppercase">
                {f.title}
              </h3>
              <p className="mt-2 text-sm font-bold leading-relaxed opacity-75">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-32">
        <div className="card-glow p-8 md:p-12 relative overflow-hidden">
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-black uppercase">Built for integrators</h2>
            <p className="mt-2 max-w-lg font-bold opacity-80">
              REST API with CORS. Fetch reputation, verify builders, embed trust scores.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2 font-mono text-xs">
              {[
                "GET /api/v1/builders/:wallet",
                "GET /api/v1/profiles/:slug",
                "GET /api/v1/reputation/:wallet",
                "POST /api/v1/verify",
              ].map((route) => (
                <div
                  key={route}
                  className="border-[3px] border-black bg-[#00f0ff] px-3 py-2.5 text-black font-black shadow-[3px_3px_0_#0a0a0a]"
                >
                  {route}
                </div>
              ))}
            </div>
            <Link href="/developers" className="btn btn-primary mt-8 inline-flex">
              Read API docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
