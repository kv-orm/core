import { Cache } from './Cache'
import { BaseEntity } from '../Entity/Entity'
import { optimizeInstructions } from './optimizeInstructions'
import { getDatastore } from '../utils/datastore'
import { getConstructor } from '../utils/entities'
import { cacheStabilize } from './cacheStabilize'

export const cacheSync = async (
  cache: Cache,
  instance: BaseEntity
): Promise<boolean> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const instructions = await optimizeInstructions(cache, instance)

  if (instructions.length === 0) return Promise.resolve(false)

  for (const instruction of instructions) {
    await instruction.performOnDatastore(datastore)
  }

  await cacheStabilize(cache, instance)
  cache.instructions.set(instance, [])

  return Promise.resolve(true)
}
