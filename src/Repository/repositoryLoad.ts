import { EntityConstructor, BaseEntity } from "../Entity/Entity";
import { Value, Datastore } from "../Datastore/Datastore";
import { createEmptyInstance, getEntityMetadata } from "../utils/entities";
import {
  getPrimaryColumnMetadata,
  setPrimaryColumnValue,
} from "../utils/columns";
import { RepositoryLoadError } from "./RepositoryLoadError";
import { getDatastore } from "../utils/datastore";
import { generatePropertyKey } from "../utils/keyGeneration";
import { EntityNotFoundError } from "./EntityNotFoundError";
import { ColumnMetadata } from "../Column/columnMetadata";

const assertIdentifierValid = (
  constructor: EntityConstructor,
  primaryColumnMetadata: ColumnMetadata | undefined,
  identifier: Value
): void => {
  if (primaryColumnMetadata === undefined && identifier !== undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is a singleton, so cannot load with an identifier.`
    );
  } else if (primaryColumnMetadata !== undefined && identifier === undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is not a singleton, and so requires an identifier to load with.`
    );
  }
};

const loadNonSingleton = async (
  datastore: Datastore,
  constructor: EntityConstructor,
  instance: BaseEntity,
  primaryColumnMetadata: ColumnMetadata,
  identifier: Value
): Promise<void> => {
  setPrimaryColumnValue(instance, identifier);
  const key = generatePropertyKey(instance, primaryColumnMetadata);
  const loadedIdentifier = await datastore.read(key);
  if (String(loadedIdentifier) !== identifier.toString())
    throw new EntityNotFoundError(constructor, identifier);

  setPrimaryColumnValue(instance, loadedIdentifier);
};

export const repositoryLoad = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  identifier?: Value
): Promise<T> => {
  const datastore = getDatastore(constructor);
  const instance = createEmptyInstance(constructor);
  const primaryColumnMetadata = getPrimaryColumnMetadata(constructor);

  assertIdentifierValid(constructor, primaryColumnMetadata, identifier);

  if (primaryColumnMetadata !== undefined && identifier !== undefined) {
    await loadNonSingleton(
      datastore,
      constructor,
      instance,
      primaryColumnMetadata,
      identifier
    );
  } else {
    // Entity is a singleton
    // Should we still somehow check if it has been saved before and throw a notfound error?
  }

  return instance;
};
