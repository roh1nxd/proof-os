/** ProofOS entity attribute `type` values — indexed for Arkiv queries */
export const ENTITY_TYPES = {
  PROFILE: "proofos_profile",
  CONTRIBUTION: "proofos_contribution",
  ENDORSEMENT: "proofos_endorsement",
  BADGE: "proofos_badge",
} as const;

/** Long-lived reputation data (Arkiv charges by storage duration) */
export const ENTITY_TTL_DAYS = 365;
