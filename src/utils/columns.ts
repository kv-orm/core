import '../metadata'

import { EntityConstructor, BaseEntity, PropertyKey } from '../Entity/Entity'
import { COLUMN_KEY } from '../Column/Column'
import { ColumnMetadata } from '../Column/columnMetadata'
import {
  ColumnLookupError,
  PrimaryColumnMissingError,
  ReadOnlyError,
} from './errors'
import { getConstructor } from './entities'
import { getDatastore } from './datastore'
import { getCache } from './cache'
import { Value } from '../Datastore/Datastore'
import { getMetadatas, getMetadata, setMetadata } from './metadata'
import { CacheMissingPrimaryColumnValueError } from '../Cache/CacheMissingPrimaryColumnValueError'

export const getColumnMetadatas = (
  constructor: EntityConstructor
): ColumnMetadata[] => getMetadatas(COLUMN_KEY, constructor) as ColumnMetadata[]

export const getColumnMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): ColumnMetadata => {
  const columnMetadatas = getColumnMetadatas(constructor)
  return getMetadata(columnMetadatas, property, () => {
    throw new ColumnLookupError(
      constructor,
      property,
      `Could not find Column. Has it been defined yet?`
    )
  }) as ColumnMetadata
}

export const setColumnMetadata = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata
): void => setMetadata(COLUMN_KEY, constructor, columnMetadata)

export const getPrimaryColumnMetadata = (
  constructor: EntityConstructor
): ColumnMetadata | undefined => {
  return getColumnMetadatas(constructor).find(({ isPrimary }) => isPrimary)
}

const assertHasPrimaryColumn = (constructor: EntityConstructor): void => {
  if (getPrimaryColumnMetadata(constructor) === undefined)
    throw new PrimaryColumnMissingError(constructor)
}

export const getPrimaryColumnValue = (instance: BaseEntity): Value => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)
  assertHasPrimaryColumn(constructor)
  return cache.getPrimaryColumnValue(instance)
}

const assertPrimaryColumnHasNoValue = (instance: BaseEntity): void => {
  try {
    const primaryColumnValue = getPrimaryColumnValue(instance)
    if (primaryColumnValue !== undefined) {
      const constructor = getConstructor(instance)
      const primaryColumnMetadata = getPrimaryColumnMetadata(
        constructor
      ) as ColumnMetadata
      throw new ReadOnlyError(
        constructor,
        primaryColumnMetadata.property,
        `Primary Column Value has already been set`
      )
    }
  } catch (e) {
    if (!(e instanceof CacheMissingPrimaryColumnValueError)) throw e
  }
}

export const setPrimaryColumnValue = (
  instance: BaseEntity,
  value: Value
): void => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)
  assertPrimaryColumnHasNoValue(instance)
  return cache.setPrimaryColumnValue(instance, value)
}
