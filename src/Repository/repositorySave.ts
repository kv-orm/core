import { BaseEntity } from '../Entity/Entity'
import { getDatastore } from '../utils/datastore'
import { getConstructor } from '../utils/entities'
import { getCache } from '../utils/cache'

export const repositorySave = async (
  instance: BaseEntity
): Promise<boolean> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)
  return cache.sync(instance)
}
