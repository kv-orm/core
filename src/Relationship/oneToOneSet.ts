import { BaseEntity } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entity'
import { getDatastore } from '../utils/datastore'
import { getCache } from '../utils/cache'
import {
  generateRelationshipKey,
  generateOneRelationshipKey,
} from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'

// TODO: Cache?
export const oneToOneSet = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  value: BaseEntity
): void => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)

  const keyGenerator = (): Key =>
    generateOneRelationshipKey(instance, relationshipMetadata)
  cache.write(instance, keyGenerator, generateRelationshipKey(value))
}
