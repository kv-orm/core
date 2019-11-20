import { BaseEntity } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generateManyRelationshipKey,
  generateRelationshipKey,
} from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'

export const oneToManySet = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  values: BaseEntity[]
): void => {
  const { cache } = getConstructorDatastoreCache(instance)

  for (const value of values) {
    const keyGenerator = (): Key =>
      generateManyRelationshipKey(instance, relationshipMetadata, value)

    cache.write(instance, keyGenerator, generateRelationshipKey(value))
  }
}
