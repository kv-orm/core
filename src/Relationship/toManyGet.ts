import { BaseEntity } from "../Entity/Entity";
import { getConstructor } from "../utils/entities";
import { getDatastore } from "../utils/datastore";
import { generateManyRelationshipSearchKey } from "../utils/keyGeneration";
import { ToManyRelationshipMetadata } from "./relationshipMetadata";
import { hydrateMany, getHydrator } from "../utils/hydrate";
import {
  arrayToAsyncGenerator,
  makeCachingGenerator,
  combineAsyncGenerators,
} from "../utils/relationships";
import { getPrimaryColumnValue } from "../utils/columns";

export const toManyGet = (
  instance: BaseEntity,
  toManyRelationshipMetadata: ToManyRelationshipMetadata
): AsyncGenerator<BaseEntity> => {
  const cachedRelationshipInstances =
    toManyRelationshipMetadata.instances.get(instance) || [];
  const primaryColumnValueInstances = cachedRelationshipInstances.map(
    (instance) => getPrimaryColumnValue(instance)
  );

  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);
  const hydrator = getHydrator(toManyRelationshipMetadata.type());

  const searchKey = generateManyRelationshipSearchKey(
    instance,
    toManyRelationshipMetadata
  );

  const cachingGenerator = makeCachingGenerator(
    instance,
    toManyRelationshipMetadata
  );

  return combineAsyncGenerators(
    arrayToAsyncGenerator(cachedRelationshipInstances),
    cachingGenerator(
      hydrateMany(datastore, searchKey, hydrator, {
        skip: (identifier) => primaryColumnValueInstances.includes(identifier),
      })
    )
  );
};
