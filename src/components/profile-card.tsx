import type { CSSProperties, ReactNode } from "react";

import { SocialLinks } from "@/components/profile/social-links";
import type { ReputationResult } from "@/lib/arkiv/reputation";
import type { ProfilePayload } from "@/lib/arkiv/types";

type StoredEntity<T> = {
  entityKey: string;
  payload: T;
};

type ContributionPayload = { project: string; role: string; description?: string };
type EndorsementPayload = { message: string };
type BadgePayload = { badge: string; issuedBy?: string };

type Props = {
  slug: string;
  wallet: string;
  profile: StoredEntity<ProfilePayload>;
  reputation: ReputationResult;
  contributions: StoredEntity<ContributionPayload>[];
  endorsements: StoredEntity<EndorsementPayload>[];
  badges: StoredEntity<BadgePayload>[];
};

export function ProfileCard({
  slug,
  wallet,
  profile,
  reputation,
  contributions,
  endorsements,
  badges,
}: Props) {
  const { displayName, bio, skills, avatarUrl, ens } = profile.payload;
  const pct = Math.round((reputation.score / reputation.maxScore) * 100);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <div className="card-glow overflow-hidden">
        <div className="h-4 brutal-stripe" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="shrink-0">
              <div className="h-32 w-32 border-[4px] border-black shadow-[6px_6px_0_#0a0a0a] bg-[#ffe600] overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-black">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="badge badge-success mb-3">Arkiv verified</span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">
                {displayName}
              </h1>
              <p className="mt-2 font-mono text-sm font-bold bg-[#00f0ff] inline-block px-2 py-0.5 border-2 border-black">
                /{slug}
              </p>
              {bio ? <p className="mt-4 text-base font-medium leading-relaxed">{bio}</p> : null}
              {skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="badge badge-warning">
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-5">
                <SocialLinks profile={profile.payload} />
              </div>
              {ens ? (
                <p className="mt-3 text-xs font-bold uppercase tracking-wider opacity-60">{ens}</p>
              ) : null}
            </div>

            <div className="shrink-0 text-center md:text-right">
              <p className="label mb-2">Trust</p>
              <div
                className="score-ring h-20 w-20 mx-auto md:mx-0 md:ml-auto flex items-center justify-center"
                style={{ "--pct": pct } as CSSProperties}
              >
                <span className="text-2xl font-black bg-white/90 w-[calc(100%-8px)] h-[calc(100%-8px)] flex items-center justify-center border-2 border-black">
                  {reputation.score}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mono text-[10px] break-all border-t-[3px] border-black pt-4 opacity-50">
            {wallet}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Proofs", val: reputation.breakdown.contributions, c: "card-cyan" },
          { label: "Endorse", val: reputation.breakdown.endorsementsReceived, c: "card-magenta" },
          { label: "Badges", val: reputation.breakdown.badges, c: "card-yellow" },
          { label: "Profile", val: reputation.breakdown.profileBonus, c: "card-lime" },
        ].map((s) => (
          <div key={s.label} className={`card p-4 text-center ${s.c}`}>
            <p className="text-2xl font-black">{s.val}</p>
            <p className="text-[10px] font-black uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        <ProofSection title="Contributions" count={contributions.length} color="bg-[#00f0ff]">
          {contributions.map((c) => (
            <ProofItem key={c.entityKey} title={c.payload.project} sub={c.payload.role}>
              {c.payload.description ? (
                <p className="text-sm mt-2 font-medium">{c.payload.description}</p>
              ) : null}
            </ProofItem>
          ))}
        </ProofSection>

        <ProofSection title="Endorsements" count={endorsements.length} color="bg-[#ff006e]">
          {endorsements.map((e) => (
            <ProofItem key={e.entityKey} title={`"${e.payload.message}"`} light />
          ))}
        </ProofSection>

        <ProofSection title="Badges" count={badges.length} color="bg-[#b8ff00]">
          {badges.map((b) => (
            <ProofItem key={b.entityKey} title={b.payload.badge} sub={b.payload.issuedBy} />
          ))}
        </ProofSection>
      </div>
    </div>
  );
}

function ProofSection({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight">
        <span className={`${color} border-[3px] border-black px-2 py-0.5 shadow-[3px_3px_0_#0a0a0a]`}>
          {title}
        </span>
        <span className="badge badge-muted">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="mt-3 text-sm font-bold opacity-50">Nothing on Arkiv yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">{children}</ul>
      )}
    </section>
  );
}

function ProofItem({
  title,
  sub,
  light,
  children,
}: {
  title: string;
  sub?: string;
  light?: boolean;
  children?: ReactNode;
}) {
  return (
    <li
      className={`card p-4 border-l-[6px] border-l-black ${light ? "bg-white" : "bg-[#fafafa]"}`}
    >
      <p className="font-black">{title}</p>
      {sub ? <p className="text-sm font-bold opacity-60 mt-1">{sub}</p> : null}
      {children}
    </li>
  );
}
