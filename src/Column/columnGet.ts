import { BaseEntity } from '../Entity/Entity'
import { ColumnKey, newDefaultCachedValue } from './Column'
import { Value } from '../Datastore/Datastore'
import { getEntityConstructor } from '../utils/entity'
import { getDatastore } from '../utils/datastore'
import { getColumn, setColumn } from '../utils/columns'
import { generatePropertyKey } from '../utils/keyGeneration'

export const columnGet = async (
  instance: BaseEntity,
  property: ColumnKey
): Promise<Value> => {
  const constructor = getEntityConstructor(instance)
  const datastore = getDatastore(constructor)
  const columnMetadata = getColumn(instance, property)
  const cachedValue =
    columnMetadata.cachedValues.get(instance) || newDefaultCachedValue()

  if (cachedValue.cachedValue === undefined) {
    cachedValue.cachedValue = await datastore.read(
      await generatePropertyKey(datastore, instance, columnMetadata)
    )
  }

  columnMetadata.cachedValues.set(instance, cachedValue)
  setColumn(instance, columnMetadata)

  return cachedValue.cachedValue
}
