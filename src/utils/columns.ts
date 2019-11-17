import '../metadata'

import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { COLUMN_KEY, ColumnMetadata, ColumnKey } from '../Column/Column'
import { ColumnLookupError, PrimaryColumnMissingError } from './errors'
import { getConstructor } from './entity'
import { getDatastore } from './datastore'
import { getCache } from './cache'
import { Value } from '../Datastore/Datastore'

export const getColumns = (
  constructor: EntityConstructor
): ColumnMetadata[] => {
  return Reflect.getMetadata(COLUMN_KEY, constructor) || []
}

const setColumns = (
  constructor: EntityConstructor,
  columns: ColumnMetadata[]
): void => {
  Reflect.defineMetadata(COLUMN_KEY, columns, constructor)
}

export const getColumn = (
  constructor: EntityConstructor,
  property: ColumnKey
): ColumnMetadata => {
  const columns = getColumns(constructor)
  const column = columns.find(({ property: p }) => p === property)
  if (column === undefined)
    throw new ColumnLookupError(
      constructor,
      property,
      `Could not find Column. Has it been defined yet?`
    )

  return column
}

export const setColumn = (
  constructor: EntityConstructor,
  column: ColumnMetadata
): void => {
  const columns = getColumns(constructor)
  columns.push(column)
  setColumns(constructor, columns)
}

export const getPrimaryColumn = (
  constructor: EntityConstructor
): ColumnMetadata | undefined => {
  return getColumns(constructor).find(({ isPrimary }) => isPrimary)
}

const assertHasPrimaryColumn = (constructor: EntityConstructor): void => {
  if (getPrimaryColumn(constructor) === undefined)
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
