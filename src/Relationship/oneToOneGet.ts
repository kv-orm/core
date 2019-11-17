import { BaseEntity } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entity'
import { getDatastore } from '../utils/datastore'
import { generateOneRelationshipKey } from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'
import { getCache } from '../utils/cache'

export const oneToOneGet = async (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Promise<Value> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)

  const key = generateOneRelationshipKey(instance, relationshipMetadata)

  return await cache.read(instance, key)
}
