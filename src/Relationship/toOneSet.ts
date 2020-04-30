import { BaseEntity } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import {
  getConstructorDatastoreCache,
  getConstructor,
} from "../utils/entities";
import {
  generateRelationshipKey,
  generateOneRelationshipKey,
} from "../utils/keyGeneration";
import {
  ToOneRelationshipMetadata,
  ToManyRelationshipMetadata,
} from "./relationshipMetadata";
import {
  setToOneRelationshipMetadata,
  getToOneRelationshipMetadata,
  getRelationshipMetadata,
} from "../utils/relationships";
import { addTo } from "./addTo";

export const toOneSet = (
  instance: BaseEntity,
  toOneRelationshipMetadata: ToOneRelationshipMetadata,
  value: BaseEntity,
  { skipBackRef }: { skipBackRef: boolean } = { skipBackRef: false }
): void => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);

  const keyGenerator = (): Key =>
    generateOneRelationshipKey(instance, toOneRelationshipMetadata);
  cache.write(instance, keyGenerator, generateRelationshipKey(value));

  toOneRelationshipMetadata.instance.set(instance, value);
  setToOneRelationshipMetadata(constructor, toOneRelationshipMetadata);

  if (toOneRelationshipMetadata.backRef && !skipBackRef) {
    const relationshipConstructor = toOneRelationshipMetadata.type();
    const relationshipRelationshipMetadata = getRelationshipMetadata(
      relationshipConstructor,
      toOneRelationshipMetadata.backRef
    );

    switch (relationshipRelationshipMetadata.cardinality) {
      case "ToOne":
        toOneSet(
          value,
          relationshipRelationshipMetadata as ToOneRelationshipMetadata,
          instance,
          {
            skipBackRef: true,
          }
        );
        break;
      case "ToMany":
        addTo(value, toOneRelationshipMetadata.backRef, instance);
        break;
    }
  }
};
