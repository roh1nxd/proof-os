import { eq } from "@arkiv-network/sdk/query";

import { walletQueryKey } from "@/lib/security/wallet";

import { ENTITY_TYPES } from "./constants";
import { getPublicClient } from "./clients";
import { parseEntities } from "./parse";
import type {
  BadgePayload,
  ContributionPayload,
  EndorsementPayload,
  ProfilePayload,
  StoredEntity,
} from "./types";

async function fetchByType<T>(
  type: string,
  filters: Array<{ key: string; value: string }>,
  limit = 50,
): Promise<StoredEntity<T>[]> {
  const client = getPublicClient();
  let query = client.buildQuery().where(eq("type", type));

  for (const f of filters) {
    query = query.where(eq(f.key, f.value));
  }

  const result = await query
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return parseEntities<T>(result.entities);
}

export async function getProfileBySlug(
  slug: string,
): Promise<StoredEntity<ProfilePayload> | null> {
  const rows = await fetchByType<ProfilePayload>(ENTITY_TYPES.PROFILE, [
    { key: "slug", value: slug },
  ], 1);
  return rows[0] ?? null;
}

export async function getProfileByWallet(
  wallet: `0x${string}`,
): Promise<StoredEntity<ProfilePayload> | null> {
  const rows = await fetchByType<ProfilePayload>(ENTITY_TYPES.PROFILE, [
    { key: "wallet", value: walletQueryKey(wallet) },
  ], 1);
  return rows[0] ?? null;
}

export async function getContributionsByWallet(
  wallet: `0x${string}`,
): Promise<StoredEntity<ContributionPayload>[]> {
  return fetchByType<ContributionPayload>(ENTITY_TYPES.CONTRIBUTION, [
    { key: "wallet", value: walletQueryKey(wallet) },
  ]);
}

export async function getEndorsementsReceived(
  wallet: `0x${string}`,
): Promise<StoredEntity<EndorsementPayload>[]> {
  return fetchByType<EndorsementPayload>(ENTITY_TYPES.ENDORSEMENT, [
    { key: "to", value: walletQueryKey(wallet) },
  ]);
}

export async function getEndorsementsGiven(
  wallet: `0x${string}`,
): Promise<StoredEntity<EndorsementPayload>[]> {
  return fetchByType<EndorsementPayload>(ENTITY_TYPES.ENDORSEMENT, [
    { key: "from", value: walletQueryKey(wallet) },
  ]);
}

export async function getBadgesByWallet(
  wallet: `0x${string}`,
): Promise<StoredEntity<BadgePayload>[]> {
  return fetchByType<BadgePayload>(ENTITY_TYPES.BADGE, [
    { key: "wallet", value: walletQueryKey(wallet) },
  ]);
}
