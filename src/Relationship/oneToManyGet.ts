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
  extractManyRelationshipValueKey,
} from "../utils/keyGeneration";
import { RelationshipMetadata } from "./relationshipMetadata";

export async function* oneToManyGet(
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  hydrator: (identifier: Value) => Promise<BaseEntity>
): AsyncGenerator<BaseEntity> {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);

  const searchKey = generateManyRelationshipSearchKey(
    instance,
    relationshipMetadata
  );
  const searchStrategy = pickSearchStrategy(datastore);

  const keyGenerator = keysFromSearch(datastore, {
    strategy: searchStrategy,
    term: searchKey,
  });

  while (true) {
    const { done, value } = await keyGenerator.next();
    if (done) return;

    const primaryColumnValue = extractManyRelationshipValueKey(
      datastore,
      value,
      searchKey
    );
    yield await hydrator(primaryColumnValue);
  }
}
