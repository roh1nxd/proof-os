import type { StoredEntity } from "./types";
import type { BadgePayload, ContributionPayload, EndorsementPayload } from "./types";

const WEIGHTS = {
  contribution: 10,
  endorsementReceived: 15,
  badge: 20,
  profileComplete: 5,
} as const;

export type ReputationResult = {
  score: number;
  maxScore: 100;
  breakdown: {
    contributions: number;
    endorsementsReceived: number;
    badges: number;
    profileBonus: number;
  };
  counts: {
    contributions: number;
    endorsementsReceived: number;
    badges: number;
  };
};

export function computeReputation(input: {
  contributions: StoredEntity<ContributionPayload>[];
  endorsementsReceived: StoredEntity<EndorsementPayload>[];
  badges: StoredEntity<BadgePayload>[];
  hasProfile: boolean;
}): ReputationResult {
  const contributionPts =
    input.contributions.length * WEIGHTS.contribution;
  const endorsementPts =
    input.endorsementsReceived.length * WEIGHTS.endorsementReceived;
  const badgePts = input.badges.length * WEIGHTS.badge;
  const profileBonus = input.hasProfile ? WEIGHTS.profileComplete : 0;

  const raw =
    contributionPts + endorsementPts + badgePts + profileBonus;
  const score = Math.min(100, raw);

  return {
    score,
    maxScore: 100,
    breakdown: {
      contributions: contributionPts,
      endorsementsReceived: endorsementPts,
      badges: badgePts,
      profileBonus,
    },
    counts: {
      contributions: input.contributions.length,
      endorsementsReceived: input.endorsementsReceived.length,
      badges: input.badges.length,
    },
  };
}
