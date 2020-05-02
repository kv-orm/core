import { EntityConstructor, BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getColumnMetadata } from "../utils/columns";
import { PropertyKey } from "../Entity/Entity";
import { getIndexableSearchKey } from "../utils/keyGeneration";
import { getDatastore } from "../utils/datastore";
import { ColumnNotSearchableError } from "./ColumnNotSearchableError";
import { getHydrator, hydrateMany } from "../utils/hydrate";

export const repositorySearch = async <T extends BaseEntity>(
  constructor: EntityConstructor,
  property: PropertyKey,
  identifier: Value
): Promise<AsyncGenerator<T>> => {
  const datastore = getDatastore(constructor);
  const columnMetadata = getColumnMetadata(constructor, property);

  if (!columnMetadata.isIndexable)
    throw new ColumnNotSearchableError(
      constructor,
      columnMetadata,
      `Column is not set as isIndexable`
    );

  const searchKey = getIndexableSearchKey(
    constructor,
    columnMetadata,
    identifier
  );
  const hydrator = getHydrator(constructor);
  return hydrateMany(datastore, searchKey, hydrator);
};
