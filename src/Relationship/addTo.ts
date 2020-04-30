import { getConstructorDatastoreCache } from "../utils/entities";
import { BaseEntity } from "../Entity/Entity";
import {
  getToManyRelationshipMetadata,
  setToManyRelationshipMetadata,
} from "../utils/relationships";
import { Key } from "../Datastore/Datastore";
import {
  generateManyRelationshipKey,
  generateRelationshipKey,
} from "../utils/keyGeneration";

export const addTo = (
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
  cache.write(instance, keyGenerator, generateRelationshipKey(value));

  const cachedRelationshipInstances = [
    ...(toManyRelationshipMetadata.instances.get(instance) || []),
    value,
  ];
  toManyRelationshipMetadata.instances.set(
    instance,
    cachedRelationshipInstances
  );
  setToManyRelationshipMetadata(constructor, toManyRelationshipMetadata);
};
