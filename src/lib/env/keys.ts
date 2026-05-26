/** Normalize relayer private key — accepts with or without 0x prefix */
export function normalizePrivateKey(raw: string | undefined): `0x${string}` | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) return null;
  return `0x${hex}` as `0x${string}`;
}

export function isSessionSecretValid(): boolean {
  const s = process.env.SESSION_SECRET ?? "";
  return s.length >= 32;
}
