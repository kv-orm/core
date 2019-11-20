import { BaseEntity } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generateRelationshipKey,
  generateOneRelationshipKey,
} from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'

export const oneToOneSet = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  value: BaseEntity
): void => {
  const { cache } = getConstructorDatastoreCache(instance)

  const keyGenerator = (): Promise<Key> =>
    Promise.resolve(generateOneRelationshipKey(instance, relationshipMetadata))
  cache.write(instance, keyGenerator, generateRelationshipKey(value))
}
