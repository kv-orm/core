import { EntityConstructor, BaseEntity } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { getColumnMetadata, getPrimaryColumnMetadata } from "../utils/columns";
import { PropertyKey } from "../Entity/Entity";
import { getUniqueSearchKey } from "../utils/keyGeneration";
import { repositoryLoad } from "./repositoryLoad";
import { getDatastore } from "../utils/datastore";
import { ColumnNotFindableError } from "./ColumnNotFindableError";
import { RepositoryFindError } from "./RepositoryFindError";

const assertNotSingleton = (constructor: EntityConstructor) => {
  const primaryColumnMetadata = getPrimaryColumnMetadata(constructor);

  if (primaryColumnMetadata === undefined)
    throw new RepositoryFindError(
      constructor,
      `Entity is a singleton, so cannot perform a find with it's repository. Try simply loading with repository.load() instead.`
    );
};

export const repositoryFind = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  property: PropertyKey,
  identifier: Value
): Promise<T | null> => {
  const datastore = getDatastore(constructor);
  const columnMetadata = getColumnMetadata(constructor, property);
  assertNotSingleton(constructor);

  if (!columnMetadata.isIndexable)
    throw new ColumnNotFindableError(
      constructor,
      columnMetadata,
      `Column is not set as isIndexable`
    );

  if (!columnMetadata.isUnique)
    throw new ColumnNotFindableError(
      constructor,
      columnMetadata,
      `Column is not set as isUnique`
    );

  const key = getUniqueSearchKey(constructor, columnMetadata, identifier);
  const primaryIdentifier = await datastore.read(key);

  if (primaryIdentifier !== null) {
    return await repositoryLoad(constructor, primaryIdentifier);
  } else {
    return null;
  }
};
