import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk/utils";

import { walletQueryKey } from "@/lib/security/wallet";

import { ENTITY_TTL_DAYS, ENTITY_TYPES } from "./constants";
import { getWalletClient } from "./clients";
import type {
  BadgePayload,
  ContributionPayload,
  EndorsementPayload,
  ProfilePayload,
} from "./types";

const expiresIn = ExpirationTime.fromDays(ENTITY_TTL_DAYS);

export async function createProfileEntity(
  wallet: `0x${string}`,
  slug: string,
  payload: ProfilePayload,
) {
  const client = getWalletClient();
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPES.PROFILE },
      { key: "slug", value: slug },
      { key: "wallet", value: walletQueryKey(wallet) },
    ],
    expiresIn,
  });
}

export async function createContributionEntity(
  wallet: `0x${string}`,
  payload: ContributionPayload,
) {
  const client = getWalletClient();
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPES.CONTRIBUTION },
      { key: "wallet", value: walletQueryKey(wallet) },
      { key: "project", value: payload.project.slice(0, 120) },
    ],
    expiresIn,
  });
}

export async function createEndorsementEntity(
  from: `0x${string}`,
  to: `0x${string}`,
  payload: EndorsementPayload,
) {
  const client = getWalletClient();
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPES.ENDORSEMENT },
      { key: "from", value: walletQueryKey(from) },
      { key: "to", value: walletQueryKey(to) },
    ],
    expiresIn,
  });
}

export async function updateProfileEntity(
  wallet: `0x${string}`,
  slug: string,
  payload: ProfilePayload,
) {
  const client = getWalletClient();
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPES.PROFILE },
      { key: "slug", value: slug },
      { key: "wallet", value: walletQueryKey(wallet) },
    ],
    expiresIn,
  });
}

export async function createBadgeEntity(
  wallet: `0x${string}`,
  payload: BadgePayload,
) {
  const client = getWalletClient();
  return client.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPES.BADGE },
      { key: "wallet", value: walletQueryKey(wallet) },
      { key: "badge", value: payload.badge.slice(0, 64) },
    ],
    expiresIn,
  });
}
