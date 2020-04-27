import { EntityConstructor, BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getColumnMetadata } from "../utils/columns";
import { PropertyKey } from "../Entity/Entity";
import { getIndexableSearchKey } from "../utils/keyGeneration";
import { repositoryLoad } from "./repositoryLoad";
import { getDatastore } from "../utils/datastore";
import { ColumnNotSearchableError } from "./ColumnNotSearchableError";

export const repositoryFind = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  property: PropertyKey,
  identifier: Value
): Promise<T | null> => {
  const datastore = getDatastore(constructor);
  const columnMetadata = getColumnMetadata(constructor, property);

  if (!columnMetadata.isIndexable)
    throw new ColumnNotSearchableError(
      constructor,
      columnMetadata,
      `Column is not set as isIndexable`
    );

  if (!columnMetadata.isUnique)
    throw new ColumnNotSearchableError(
      constructor,
      columnMetadata,
      `Column is not set as isUnique`
    );

  const key = getIndexableSearchKey(constructor, columnMetadata, identifier);
  const primaryIdentifier = await datastore.read(key);

  if (primaryIdentifier !== null) {
    return await repositoryLoad(constructor, primaryIdentifier);
  } else {
    return null;
  }
};
