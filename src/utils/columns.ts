import '../metadata'

import { BaseEntity } from '../Entity'
import {
  ColumnMetadata,
  COLUMN_METADATA_KEY,
  COLUMNS_ON_ENTITY_KEY,
  ColumnKey,
} from '../Column'
import { Value } from '../Datastore'

export const getColumns = (instance: BaseEntity): ColumnMetadata[] => {
  const properties = Reflect.getMetadata(
    COLUMNS_ON_ENTITY_KEY,
    instance
  ) as ColumnKey[]
  return properties
    .map(property =>
      Reflect.getMetadata(COLUMN_METADATA_KEY, instance, property.toString())
    )
    .filter(metadata => metadata !== undefined)
}

export const getPrimaryColumn = (
  instance: BaseEntity
): ColumnMetadata | undefined => {
  return getColumns(instance).find(({ isPrimary }) => isPrimary)
}

export const getPrimaryColumnValue = async (
  instance: BaseEntity
): Promise<Value> => {
  const primaryColumn = getPrimaryColumn(instance)
  if (primaryColumn === undefined)
    throw new Error(`Primary Column not specified on instance`)
  return await instance[primaryColumn.property]
}

export const setPrimaryColumnValue = (
  instance: BaseEntity,
  value: Value
): void => {
  const primaryColumn = getPrimaryColumn(instance)
  if (primaryColumn === undefined)
    throw new Error(`Primary Column not specified on instance`)
  primaryColumn.cachedValues.set(instance, {
    isDirty: false,
    cachedValue: value,
  })
}
