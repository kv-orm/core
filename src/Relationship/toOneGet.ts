import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { generateOneRelationshipKey } from "../utils/keyGeneration";
import { ToOneRelationshipMetadata } from "./relationshipMetadata";
import { getHydrator } from "../utils/hydrate";
import { setToOneRelationshipMetadata } from "../utils/relationships";

export const toOneGet = async (
  instance: BaseEntity,
  toOneRelationshipMetadata: ToOneRelationshipMetadata
): Promise<BaseEntity> => {
  const cachedRelationshipInstance = toOneRelationshipMetadata.instance.get(
    instance
  );
  if (cachedRelationshipInstance) return cachedRelationshipInstance;

  const { constructor, cache } = getConstructorDatastoreCache(instance);
  const hydrator = getHydrator(toOneRelationshipMetadata.type());

  const key = generateOneRelationshipKey(instance, toOneRelationshipMetadata);
  const identifier = await cache.read(instance, key);
  const relationshipInstance = await hydrator(identifier);

  toOneRelationshipMetadata.instance.set(instance, relationshipInstance);
  setToOneRelationshipMetadata(constructor, toOneRelationshipMetadata);

  return relationshipInstance;
};
