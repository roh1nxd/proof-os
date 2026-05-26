export type SocialKey = "github" | "twitter" | "instagram" | "linkedin" | "website";

export function normalizeSocialUrl(key: SocialKey, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  switch (key) {
    case "twitter":
      return v.startsWith("@") ? `https://x.com/${v.slice(1)}` : `https://x.com/${v}`;
    case "instagram":
      return v.startsWith("@")
        ? `https://instagram.com/${v.slice(1)}`
        : `https://instagram.com/${v}`;
    case "github":
      return v.includes("/")
        ? `https://github.com/${v.replace(/^@/, "")}`
        : `https://github.com/${v}`;
    default:
      return v.startsWith("www.") ? `https://${v}` : v;
  }
}

export function hasAtLeastOneSocial(profile: {
  github?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}): boolean {
  return Boolean(
    profile.github?.trim() ||
      profile.twitter?.trim() ||
      profile.instagram?.trim() ||
      profile.linkedin?.trim() ||
      profile.website?.trim(),
  );
}
