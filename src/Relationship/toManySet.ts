import { BaseEntity } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import {
  getConstructorDatastoreCache,
  getConstructor,
} from "../utils/entities";
import {
  generateManyRelationshipKey,
  generateRelationshipKey,
} from "../utils/keyGeneration";
import {
  ToManyRelationshipMetadata,
  ToOneRelationshipMetadata,
} from "./relationshipMetadata";
import {
  setToManyRelationshipMetadata,
  getRelationshipMetadata,
} from "../utils/relationships";
import { toOneSet } from "./toOneSet";
import { addTo } from "./addTo";

export const toManySet = async (
  instance: BaseEntity,
  toManyRelationshipMetadata: ToManyRelationshipMetadata,
  values: BaseEntity[],
  { skipBackRef }: { skipBackRef: boolean } = { skipBackRef: false }
): Promise<void> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);

  for (const value of values) {
    const keyGenerator = (): Key =>
      generateManyRelationshipKey(instance, toManyRelationshipMetadata, value);
    cache.write(instance, keyGenerator, generateRelationshipKey(value));
  }

  toManyRelationshipMetadata.instances.set(instance, values);
  setToManyRelationshipMetadata(constructor, toManyRelationshipMetadata);

  if (toManyRelationshipMetadata.backRef && !skipBackRef) {
    const relationshipConstructor = toManyRelationshipMetadata.type();
    const relationshipRelationshipMetadata = getRelationshipMetadata(
      relationshipConstructor,
      toManyRelationshipMetadata.backRef
    );

    switch (relationshipRelationshipMetadata.cardinality) {
      case "ToOne":
        for (const value of values) {
          toOneSet(
            value,
            relationshipRelationshipMetadata as ToOneRelationshipMetadata,
            instance,
            {
              skipBackRef: true,
            }
          );
        }
        break;
      case "ToMany":
        for (const value of values) {
          addTo(value, toManyRelationshipMetadata.backRef, instance);
        }
        break;
    }
  }
};
