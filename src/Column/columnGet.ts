import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './columnMetadata'
import { Value } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entities'
import { getDatastore } from '../utils/datastore'
import { generatePropertyKey } from '../utils/keyGeneration'
import { getCache } from '../utils/cache'

export const columnGet = async (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<Value> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)

  const key = generatePropertyKey(instance, columnMetadata)

  return await cache.read(instance, key)
}
