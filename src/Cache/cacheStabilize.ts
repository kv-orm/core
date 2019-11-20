import { Cache } from './Cache'
import { BaseEntity } from '../Entity/Entity'
import { optimizeInstructions } from './optimizeInstructions'
import { Value, Key } from '../Datastore/Datastore'

export const cacheStabilize = async (
  cache: Cache,
  instance: BaseEntity
): Promise<boolean> => {
  const instructions = await optimizeInstructions(cache, instance)

  if (instructions.length === 0) return Promise.resolve(false)

  const data = cache.data.get(instance) || new Map<Key, Value>()

  for (const instruction of instructions) {
    data.set(await instruction.key, instruction.value)
  }

  cache.data.set(instance, data)
  return Promise.resolve(true)
}
