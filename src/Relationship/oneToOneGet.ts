import { BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getConstructorDatastoreCache } from "../utils/entities";
import { generateOneRelationshipKey } from "../utils/keyGeneration";
import { RelationshipMetadata } from "./relationshipMetadata";

export const oneToOneGet = async (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Promise<Value> => {
  const { cache } = getConstructorDatastoreCache(instance);

  const key = generateOneRelationshipKey(instance, relationshipMetadata);

  return await cache.read(instance, key);
};
