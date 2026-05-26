import type { Entity } from "@arkiv-network/sdk";

import type {
  BadgePayload,
  ContributionPayload,
  EndorsementPayload,
  ProfilePayload,
  StoredEntity,
} from "./types";

function attributesMap(entity: Entity): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attr of entity.attributes ?? []) {
    if (typeof attr.value === "string") {
      map[attr.key] = attr.value;
    }
  }
  return map;
}

export function parseEntity<T>(entity: Entity): StoredEntity<T> {
  return {
    entityKey: entity.key,
    owner: entity.owner,
    createdAtBlock: entity.createdAtBlock,
    attributes: attributesMap(entity),
    payload: entity.toJson() as T,
  };
}

export function parseEntities<T>(entities: Entity[]): StoredEntity<T>[] {
  return entities.map((e) => parseEntity<T>(e));
}

export type { ProfilePayload, ContributionPayload, EndorsementPayload, BadgePayload };
