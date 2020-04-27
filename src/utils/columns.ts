import "../metadata";

import { EntityConstructor, BaseEntity, PropertyKey } from "../Entity/Entity";
import { COLUMN_KEY } from "../Column/Column";
import { ColumnMetadata } from "../Column/columnMetadata";
import { ColumnLookupError, PrimaryColumnMissingError } from "./errors";
import { getConstructorDatastoreCache } from "./entities";
import { Value } from "../Datastore/Datastore";
import { getMetadatas, getMetadata, setMetadata } from "./metadata";

export const getColumnMetadatas = (
  constructor: EntityConstructor
): ColumnMetadata[] =>
  getMetadatas(COLUMN_KEY, constructor) as ColumnMetadata[];

export const getColumnMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): ColumnMetadata => {
  const columnMetadatas = getColumnMetadatas(constructor);
  return getMetadata(columnMetadatas, property, () => {
    throw new ColumnLookupError(
      constructor,
      property,
      `Could not find Column. Has it been defined yet?`
    );
  }) as ColumnMetadata;
};

export const setColumnMetadata = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata
): void => setMetadata(COLUMN_KEY, constructor, columnMetadata);

export const getPrimaryColumnMetadata = (
  constructor: EntityConstructor
): ColumnMetadata | undefined => {
  return getColumnMetadatas(constructor).find(({ isPrimary }) => isPrimary);
};

const assertHasPrimaryColumn = (constructor: EntityConstructor): void => {
  if (getPrimaryColumnMetadata(constructor) === undefined)
    throw new PrimaryColumnMissingError(constructor);
};

export const getPrimaryColumnValue = (
  instance: BaseEntity,
  { failSilently } = { failSilently: false }
): Value => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);
  assertHasPrimaryColumn(constructor);
  return cache.getPrimaryColumnValue(instance, { failSilently });
};

export const setPrimaryColumnValue = (
  instance: BaseEntity,
  value: Value
): void => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);
  assertHasPrimaryColumn(constructor);
  return cache.setPrimaryColumnValue(instance, value);
};
