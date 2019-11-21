import { BaseEntity } from '../Entity/Entity'
import { getConstructorDatastoreCache } from '../utils/entities'
import { generateOneRelationshipKey } from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'
import { getHydrator } from './hydrate'
import { MissingRelationshipError } from './MissingRelationshipError'
import { getDatastore } from '../utils/datastore'
import { getCache } from '../utils/cache'
import { getPrimaryColumnMetadata } from '../utils/columns'
import { EntityNotFoundError } from '../Repository/EntityNotFoundError'

export const oneToOneGet = async (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  { loadFromDatastore } = { loadFromDatastore: true }
): Promise<BaseEntity | void> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)
  const relationDatastore = getDatastore(relationshipMetadata.relationType)
  const relationCache = getCache(relationDatastore)

  const primaryColumnMetadata = getPrimaryColumnMetadata(
    relationshipMetadata.relationType
  )
  let cachedRelation
  let value

  try {
    if (primaryColumnMetadata !== undefined) {
      const key = generateOneRelationshipKey(instance, relationshipMetadata)
      value = await cache.read(instance, key)

      if (value === null) {
        throw new MissingRelationshipError(
          constructor,
          relationshipMetadata,
          `Relationship value not found in Datastore`
        )
      }

      cachedRelation = relationCache.getInstance(
        relationshipMetadata.relationType,
        value
      )
    } else {
      cachedRelation = relationCache.getInstance(
        relationshipMetadata.relationType
      )
    }

    if (cachedRelation !== undefined) return cachedRelation

    if (loadFromDatastore) {
      const hydrator = getHydrator(relationshipMetadata.relationType)
      return await hydrator(value)
    }
  } catch (e) {
    throw new EntityNotFoundError(relationshipMetadata.relationType, value)
  }
}
