import { BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getConstructor } from "../utils/entities";
import {
  getDatastore,
  keysFromSearch,
  pickSearchStrategy,
} from "../utils/datastore";
import {
  generateManyRelationshipSearchKey,
  extractValueFromSearchKey,
} from "../utils/keyGeneration";
import { RelationshipMetadata } from "./relationshipMetadata";
import { hydrator, hydrateMany } from "../utils/hydrate";

export const oneToManyGet = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  hydrator: hydrator
): AsyncGenerator<BaseEntity> => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);

  const searchKey = generateManyRelationshipSearchKey(
    instance,
    relationshipMetadata
  );
  return hydrateMany(datastore, searchKey, hydrator);
};
