import { getAddress, isAddress } from "viem";

import type { StoredEntity } from "./types";
import type { ProfilePayload } from "./types";

export function walletFromProfile(
  profile: StoredEntity<ProfilePayload>,
): `0x${string}` | null {
  const raw = profile.attributes.wallet;
  if (!raw || !isAddress(raw)) return null;
  return getAddress(raw);
}
