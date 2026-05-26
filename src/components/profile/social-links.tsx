import type { ProfilePayload } from "@/lib/arkiv/types";

type SocialKey = "github" | "twitter" | "instagram" | "linkedin" | "website";

const LABELS: Record<SocialKey, string> = {
  github: "GitHub",
  twitter: "X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  website: "Website",
};

const COLORS: Record<SocialKey, string> = {
  github: "bg-black text-white",
  twitter: "bg-[#0a0a0a] text-white",
  instagram: "bg-[#ff006e] text-white",
  linkedin: "bg-[#0077b5] text-white",
  website: "bg-[#b8ff00] text-black",
};

export function SocialLinks({ profile }: { profile: ProfilePayload }) {
  const links = (["github", "twitter", "instagram", "linkedin", "website"] as SocialKey[])
    .map((key) => {
      const raw = profile[key];
      if (!raw) return null;
      const href = raw.startsWith("http") ? raw : `https://${raw}`;
      return { key, href, label: LABELS[key] };
    })
    .filter(Boolean) as { key: SocialKey; href: string; label: string }[];

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-sm border-[3px] border-black shadow-[3px_3px_0_#0a0a0a] ${COLORS[l.key]}`}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
