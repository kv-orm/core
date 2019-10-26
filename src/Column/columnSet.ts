import { BaseEntity } from '../Entity/Entity'
import { ColumnKey } from './Column'
import { Value } from '../Datastore/Datastore'
import { getColumn, setColumn } from '../utils/columns'

export const columnSet = (
  instance: BaseEntity,
  property: ColumnKey,
  value: Value
): void => {
  const columnMetadata = getColumn(instance, property)

  columnMetadata.cachedValues.set(instance, {
    cachedValue: value,
    isDirty: true,
  })
  setColumn(instance, columnMetadata)
}
