import { Cache } from './Cache'
import { BaseEntity } from '../Entity/Entity'
import { optimizeInstructions } from './optimizeInstructions'
import { Value, Key } from '../Datastore/Datastore'

export const cacheStabilize = (cache: Cache, instance: BaseEntity): boolean => {
  const instructions = optimizeInstructions(cache, instance)

  if (instructions.length === 0) return false

  const data = cache.data.get(instance) || new Map<Key, Value>()

  for (const instruction of instructions) {
    instruction.performOnCacheData(data)
  }

  cache.data.set(instance, data)
  return true
}
