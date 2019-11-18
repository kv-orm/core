import '../metadata'

import { EntityConstructor, BaseEntity, PropertyKey } from '../Entity/Entity'
import { COLUMN_KEY } from '../Column/Column'
import { ColumnMetadata } from '../Column/columnMetadata'
import { ColumnLookupError, PrimaryColumnMissingError } from './errors'
import { getConstructor } from './entities'
import { getDatastore } from './datastore'
import { getCache } from './cache'
import { Value } from '../Datastore/Datastore'

export const getColumnMetadatas = (
  constructor: EntityConstructor
): ColumnMetadata[] => {
  return Reflect.getMetadata(COLUMN_KEY, constructor) || []
}

const setColumnMetadatas = (
  constructor: EntityConstructor,
  columnMetadatas: ColumnMetadata[]
): void => {
  Reflect.defineMetadata(COLUMN_KEY, columnMetadatas, constructor)
}

export const getColumnMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): ColumnMetadata => {
  const columnMetadatas = getColumnMetadatas(constructor)
  const columnMetadata = columnMetadatas.find(
    ({ property: p }) => p === property
  )
  if (columnMetadata === undefined)
    throw new ColumnLookupError(
      constructor,
      property,
      `Could not find Column. Has it been defined yet?`
    )

  return columnMetadata
}

export const setColumnMetadata = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata
): void => {
  const columnMetadatas = getColumnMetadatas(constructor)
  columnMetadatas.push(columnMetadata)
  setColumnMetadatas(constructor, columnMetadatas)
}

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

export const setPrimaryColumnValue = (
  instance: BaseEntity,
  value: Value
): void => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)
  assertHasPrimaryColumn(constructor)
  return cache.setPrimaryColumnValue(instance, value)
}
