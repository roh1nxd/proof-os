"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, type ReactNode } from "react";

import { AvatarUpload } from "@/components/profile/avatar-upload";
import { SetupChecklist } from "@/components/setup-checklist";
import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { ToastStack } from "@/components/ui/toast-stack";
import { WalletReputationCard } from "@/components/wallet-reputation-card";
import { useProofosAuth } from "@/hooks/use-proofos-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api/client-fetch";
import { hasAtLeastOneSocial } from "@/lib/profile/social";

type Tab = "profile" | "contribute" | "endorse" | "api";

type ExistingProfile = {
  hasProfile: boolean;
  slug?: string;
  profile?: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  } | null;
};

export default function DashboardPage() {
  const { wallet, loading, connecting, error, status, canWrite, connect, disconnect } = useProofosAuth();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("profile");
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [project, setProject] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [endorseTo, setEndorseTo] = useState("");
  const [endorseMsg, setEndorseMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Profile update state
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load existing profile when wallet connects
  const loadExistingProfile = useCallback(async () => {
    if (!wallet) return;
    setProfileLoading(true);
    const res = await apiFetch<ExistingProfile>("/api/profile");
    if (res.ok && res.data.hasProfile && res.data.profile) {
      setHasExistingProfile(true);
      setExistingSlug(res.data.slug ?? null);
      const p = res.data.profile;
      setDisplayName(p.displayName || "");
      setBio(p.bio || "");
      setAvatarUrl(p.avatarUrl || null);
      // Strip normalized URLs back to usernames for display
      setGithub(p.github || "");
      setTwitter(p.twitter || "");
      setInstagram(p.instagram || "");
      setLinkedin(p.linkedin || "");
      setWebsite(p.website || "");
      if (res.data.slug) setSlug(res.data.slug);
    } else {
      setHasExistingProfile(false);
      setExistingSlug(null);
    }
    setProfileLoading(false);
  }, [wallet]);

  useEffect(() => {
    void loadExistingProfile();
  }, [loadExistingProfile]);

  const config = status?.config
    ? {
        sessionConfigured: status.config.sessionConfigured,
        arkivWriterConfigured: status.arkiv.writerConfigured,
        relayerAddress: status.config.relayerAddress,
      }
    : undefined;

  const requireAuth = () => {
    if (!wallet) return toast.error("Connect your wallet first."), false;
    if (!canWrite) return toast.error("Set ARKIV_PRIVATE_KEY in .env.local and restart server."), false;
    return true;
  };

  const createProfile = async () => {
    if (!slug || slug.length < 3) return toast.error("Slug must be at least 3 characters.");
    if (!displayName.trim()) return toast.error("Display name is required.");
    if (!hasAtLeastOneSocial({ github, twitter, instagram, linkedin, website })) {
      return toast.error("Add at least one social link.");
    }
    if (!requireAuth()) return;

    setSubmitting(true);
    const res = await apiFetch<{ slug: string }>("/api/profile", {
      method: "POST",
      body: JSON.stringify({
        slug,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        github: github.trim() || undefined,
        twitter: twitter.trim() || undefined,
        instagram: instagram.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      toast.success(`Profile live at /${res.data.slug}`);
      setHasExistingProfile(true);
      setExistingSlug(res.data.slug);
      setIsEditMode(false);
    } else toast.error(res.body.error ?? "Failed to save profile");
  };

  const updateProfile = async () => {
    if (!displayName.trim()) return toast.error("Display name is required.");
    if (!hasAtLeastOneSocial({ github, twitter, instagram, linkedin, website })) {
      return toast.error("Add at least one social link.");
    }
    if (!requireAuth()) return;

    setSubmitting(true);
    const res = await apiFetch<{ slug: string }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        github: github.trim() || undefined,
        twitter: twitter.trim() || undefined,
        instagram: instagram.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } else toast.error(res.body.error ?? "Failed to update profile");
  };

  const addContribution = async () => {
    if (!project.trim() || !role.trim()) return toast.error("Project and role are required.");
    if (!requireAuth()) return;
    setSubmitting(true);
    const res = await apiFetch<{ entityKey: string }>("/api/contributions", {
      method: "POST",
      body: JSON.stringify({
        project: project.trim(),
        role: role.trim(),
        description: description.trim() || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Contribution saved to Arkiv");
      setProject("");
      setRole("");
      setDescription("");
    } else toast.error(res.body.error ?? "Failed to add contribution");
  };

  const addEndorsement = async () => {
    if (!endorseTo.startsWith("0x") || endorseTo.length < 42) return toast.error("Enter valid wallet.");
    if (endorseMsg.trim().length < 10) return toast.error("Message must be at least 10 chars.");
    if (!requireAuth()) return;
    setSubmitting(true);
    const res = await apiFetch<{ entityKey: string }>("/api/endorsements", {
      method: "POST",
      body: JSON.stringify({ toWallet: endorseTo.trim(), message: endorseMsg.trim() }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Endorsement published on Arkiv");
      setEndorseTo("");
      setEndorseMsg("");
    } else toast.error(res.body.error ?? "Failed to send endorsement");
  };

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-24"><div className="card h-96 animate-pulse" /></main>;

  // Render profile view (when existing profile and not editing)
  const renderProfileView = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase">Your profile</h2>
          <p className="text-sm font-bold text-black/60 mt-1">
            Live at <span className="font-mono text-black">/{existingSlug}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${existingSlug}`} className="btn btn-secondary btn-sm">
            View →
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsEditMode(true)}>
            Edit profile
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 border-[3px] border-black shadow-[4px_4px_0_#0a0a0a] bg-[#ffe600] overflow-hidden shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-black">
                {displayName.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black text-black">{displayName}</p>
            {bio ? <p className="text-sm text-black/70 font-medium mt-0.5 line-clamp-2">{bio}</p> : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "GitHub", value: github },
            { label: "X", value: twitter },
            { label: "Instagram", value: instagram },
            { label: "LinkedIn", value: linkedin },
            { label: "Website", value: website },
          ]
            .filter((s) => s.value)
            .map((s) => (
              <span key={s.label} className="badge badge-muted text-black">{s.label}</span>
            ))}
        </div>
      </div>
    </div>
  );

  // Render profile form (create or edit)
  const renderProfileForm = () => (
    <FormBlock
      title={hasExistingProfile ? "Update your profile" : "Create your profile"}
      subtitle={hasExistingProfile ? "Edit your details below. Slug cannot be changed." : "At least one social is required."}
    >
      {hasExistingProfile && isEditMode ? (
        <div className="card card-cyan px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-bold text-black">
            Editing profile <span className="font-mono">/{existingSlug}</span>
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-black"
            onClick={() => {
              setIsEditMode(false);
              void loadExistingProfile();
            }}
          >
            Cancel
          </button>
        </div>
      ) : null}

      {!hasExistingProfile ? (
        <Field label="Slug">
          <input className="input" placeholder="rohan" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
        </Field>
      ) : null}
      <Field label="Display name"><input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
      <Field label="Bio"><textarea className="input min-h-[88px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
      <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} disabled={!wallet || !canWrite} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="GitHub"><input className="input" placeholder="github username or url" value={github} onChange={(e) => setGithub(e.target.value)} /></Field>
        <Field label="X (Twitter)"><input className="input" placeholder="@username" value={twitter} onChange={(e) => setTwitter(e.target.value)} /></Field>
        <Field label="Instagram"><input className="input" placeholder="@username" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></Field>
        <Field label="LinkedIn (full URL)"><input className="input" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></Field>
      </div>
      <Field label="Website (optional)"><input className="input" placeholder="https://your-site.com" value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
      <p className="text-xs font-bold text-black/70">One social link is compulsory. Add more if you want.</p>
      {hasExistingProfile ? (
        <SubmitButton disabled={!wallet || !canWrite} loading={submitting} onClick={() => void updateProfile()}>
          Update profile on Arkiv
        </SubmitButton>
      ) : (
        <SubmitButton disabled={!wallet || !canWrite} loading={submitting} onClick={() => void createProfile()}>
          Publish profile to Arkiv
        </SubmitButton>
      )}
    </FormBlock>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />

      <div className="card p-6 md:p-8">
        <p className="badge badge-warning">Brutal dashboard</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase tracking-tight text-black">Builder Dashboard</h1>
        <p className="mt-2 text-sm font-bold text-black/70">Create profile, add proofs, and publish trust on Arkiv.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {wallet ? (
            <>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => void disconnect()}>Disconnect</button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={connecting} onClick={() => void connect()}>
                {connecting ? <Spinner /> : "Refresh session"}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" disabled={connecting} onClick={() => void connect()}>
              {connecting ? <><Spinner /> Confirm in wallet…</> : "Connect wallet"}
            </button>
          )}
        </div>
      </div>

      {error ? <div className="mt-6 card card-magenta px-4 py-3 text-sm font-bold">{error}</div> : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-4 space-y-5">
          <SetupChecklist config={config} wallet={wallet} />
          {wallet ? <WalletReputationCard wallet={wallet} /> : null}
          <ArkivStatus status={status} canWrite={canWrite} />
        </aside>

        <div className="lg:col-span-8 space-y-6">
          {wallet ? (
            <div className="card p-4 flex items-center gap-3">
              <span className="pulse-dot shrink-0" />
              <p className="font-mono text-xs break-all flex-1 text-black">{wallet}</p>
              <CopyButton text={wallet} label="Copy" />
            </div>
          ) : null}

          <div className="tabs">
            {([["profile", "Profile"], ["contribute", "Contribute"], ["endorse", "Endorse"], ["api", "API"]] as const).map(([id, label]) => (
              <button key={id} type="button" className={`tab ${tab === id ? "tab-active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          <div className="card p-6 md:p-8">
            {tab === "profile" && (
              profileLoading ? (
                <div className="flex items-center justify-center py-12 gap-3">
                  <Spinner />
                  <span className="text-sm font-bold text-black/60">Loading profile…</span>
                </div>
              ) : hasExistingProfile && !isEditMode ? (
                renderProfileView()
              ) : (
                renderProfileForm()
              )
            )}

            {tab === "contribute" && (
              <FormBlock title="Add contribution proof" subtitle="Project work verified on-chain">
                <Field label="Project"><input className="input" value={project} onChange={(e) => setProject(e.target.value)} /></Field>
                <Field label="Role"><input className="input" value={role} onChange={(e) => setRole(e.target.value)} /></Field>
                <Field label="Description (optional)"><textarea className="input min-h-[72px]" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
                <SubmitButton disabled={!wallet || !canWrite} loading={submitting} onClick={() => void addContribution()}>Add contribution</SubmitButton>
              </FormBlock>
            )}

            {tab === "endorse" && (
              <FormBlock title="Endorse a builder" subtitle="Peer attestation stored on Arkiv">
                <Field label="Recipient wallet"><input className="input font-mono text-xs" value={endorseTo} onChange={(e) => setEndorseTo(e.target.value)} /></Field>
                <Field label="Message"><textarea className="input min-h-[100px]" value={endorseMsg} onChange={(e) => setEndorseMsg(e.target.value)} /></Field>
                <SubmitButton disabled={!wallet || !canWrite} loading={submitting} onClick={() => void addEndorsement()}>Send endorsement</SubmitButton>
              </FormBlock>
            )}

            {tab === "api" && (
              <FormBlock title="Your public API" subtitle="Integrate your reputation into any product">
                {wallet ? (
                  <div className="space-y-3">
                    <ApiRow label="Full builder" path={`/api/v1/builders/${wallet}`} />
                    <ApiRow label="Reputation" path={`/api/v1/reputation/${wallet}`} />
                    <ApiRow label="Contributions" path={`/api/v1/contributions/${wallet}`} />
                    <ApiRow label="Endorsements" path={`/api/v1/endorsements/${wallet}`} />
                    <Link href="/developers" className="btn btn-secondary mt-4 inline-flex">Full API documentation →</Link>
                  </div>
                ) : <p className="text-sm font-bold text-black/70">Connect wallet to see your endpoints.</p>}
              </FormBlock>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function FormBlock({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="space-y-5"><div><h2 className="text-xl font-black uppercase text-black">{title}</h2><p className="text-sm font-bold text-black/60 mt-1">{subtitle}</p></div>{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="label text-black">{label}</label>{children}</div>;
}

function SubmitButton({ children, disabled, loading, onClick }: { children: ReactNode; disabled?: boolean; loading?: boolean; onClick: () => void }) {
  return <button type="button" className="btn btn-primary w-full sm:w-auto mt-2" disabled={disabled || loading} onClick={onClick}>{loading ? <><Spinner /> Processing…</> : children}</button>;
}

function ApiRow({ label, path }: { label: string; path: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const full = `${origin}${path}`;
  return <div className="card p-3 flex flex-col sm:flex-row sm:items-center gap-2"><div className="min-w-0 flex-1"><p className="text-xs font-bold text-black/70">{label}</p><code className="text-xs break-all text-black">{full}</code></div><CopyButton text={full} /></div>;
}

function ArkivStatus({ status, canWrite }: { status: ReturnType<typeof useProofosAuth>["status"]; canWrite: boolean }) {
  if (!status) return null;
  return (
    <div className="card p-4 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-black uppercase text-black">Arkiv Braga</span>
        <span className={canWrite ? "badge badge-success" : "badge badge-warning"}>{canWrite ? "Writer OK" : "No writer"}</span>
      </div>
      <p className="font-bold text-black">Chain {status.arkiv.chainId}</p>
      {status.arkiv.explorer ? <a href={status.arkiv.explorer} target="_blank" rel="noopener noreferrer" className="underline font-bold text-black">Open explorer →</a> : null}
    </div>
  );
}
