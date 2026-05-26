export type ProfilePayload = {
  displayName: string;
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  ens?: string;
};

export type ContributionPayload = {
  project: string;
  role: string;
  description?: string;
  github?: string;
  proofUrl?: string;
};

export type EndorsementPayload = {
  message: string;
  skills?: string[];
};

export type BadgePayload = {
  badge: string;
  issuedBy?: string;
  proofUrl?: string;
};

export type StoredEntity<T> = {
  entityKey: string;
  owner?: string;
  createdAtBlock?: number | bigint | null;
  attributes: Record<string, string>;
  payload: T;
};
