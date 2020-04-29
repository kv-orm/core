import { EntityConstructor, BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getColumnMetadata } from "../utils/columns";
import { PropertyKey } from "../Entity/Entity";
import {
  getIndexableSearchKey,
  extractManyRelationshipValueKey,
} from "../utils/keyGeneration";
import {
  getDatastore,
  pickSearchStrategy,
  keysFromSearch,
} from "../utils/datastore";
import { ColumnNotSearchableError } from "./ColumnNotSearchableError";
import { getHydrator } from "../Relationship/hydrate";

export async function* repositorySearch<T extends BaseEntity>(
  constructor: EntityConstructor,
  property: PropertyKey,
  identifier: Value
): AsyncGenerator<T> {
  const hydrator = getHydrator(constructor);
  const datastore = getDatastore(constructor);
  const columnMetadata = getColumnMetadata(constructor, property);

  if (!columnMetadata.isIndexable)
    throw new ColumnNotSearchableError(
      constructor,
      columnMetadata,
      `Column is not set as isIndexable`
    );

  const searchKey =
    getIndexableSearchKey(constructor, columnMetadata, identifier) +
    datastore.keySeparator;
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
