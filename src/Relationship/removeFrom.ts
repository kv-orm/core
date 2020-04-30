import { BaseEntity, PropertyKey } from "../Entity/Entity";
import {
  getToManyRelationshipMetadata,
  setToManyRelationshipMetadata,
} from "../utils/relationships";
import { getConstructorDatastoreCache } from "../utils/entities";
import { Key } from "../Datastore/Datastore";
import { generateManyRelationshipKey } from "../utils/keyGeneration";

export const removeFrom = (
  instance: BaseEntity,
  property: PropertyKey,
  value: BaseEntity
) => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);
  const toManyRelationshipMetadata = getToManyRelationshipMetadata(
    constructor,
    property
  );

  const keyGenerator = (): Key =>
    generateManyRelationshipKey(instance, toManyRelationshipMetadata, value);
  cache.delete(instance, keyGenerator);

  const cachedRelationshipInstances =
    toManyRelationshipMetadata.instances.get(instance) || [];
  const indexOfInstance = cachedRelationshipInstances.indexOf(value);
  if (indexOfInstance !== -1) {
    cachedRelationshipInstances.splice(indexOfInstance, 1);
    toManyRelationshipMetadata.instances.set(
      instance,
      cachedRelationshipInstances
    );
    setToManyRelationshipMetadata(constructor, toManyRelationshipMetadata);
  }
};
