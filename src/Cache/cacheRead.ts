import { Cache } from './Cache'
import { BaseEntity } from '../Entity/Entity'
import { Key, Value } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entities'
import { getDatastore } from '../utils/datastore'
import { cacheStabilize } from './cacheStabilize'

export const cacheRead = async (
  cache: Cache,
  instance: BaseEntity,
  key: Key
): Promise<Value> => {
  await cacheStabilize(cache, instance)
  const data = cache.data.get(instance) || new Map<Key, Value>()
  let value = data.get(key) || null
  if (value !== null) return value

  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  value = await datastore.read(key)
  data.set(key, value)
  cache.data.set(instance, data)
  return value
}
