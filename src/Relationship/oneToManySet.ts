import { BaseEntity } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entity'
import { getDatastore } from '../utils/datastore'
import { getCache } from '../utils/cache'
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
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)

  for (const value of values) {
    const keyGenerator = (): Key =>
      generateManyRelationshipKey(instance, relationshipMetadata, value)
    cache.write(instance, keyGenerator, generateRelationshipKey(value))
  }
}
