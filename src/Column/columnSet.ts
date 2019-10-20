import { BaseEntity } from '../Entity/Entity'
import { ColumnKey } from './Column'
import { Value } from '../Datastore/Datastore'
import { getColumn, setColumn } from '../utils/columns'

export const columnSet = async (
  instance: BaseEntity,
  property: ColumnKey,
  value: Value
): Promise<void> => {
  const columnMetadata = getColumn(instance, property)

  columnMetadata.cachedValues.set(instance, {
    cachedValue: value,
    isDirty: true,
  })
  setColumn(instance, columnMetadata)
}
