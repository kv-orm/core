import { BaseEntity } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructorDatastoreCache, getConstructor } from '../utils/entities'
import { generateOneRelationshipKey } from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'
import { oneToOneGet } from './oneToOneGet'
import { getRepository } from '../Repository/Repository'
import { MissingRelationshipError } from './MissingRelationshipError'

export const oneToOneDelete = async (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Promise<void> => {
  const { cache } = getConstructorDatastoreCache(instance)
  let alreadyDeleted = false

  if (relationshipMetadata.cascade.onDelete) {
    try {
      const relation = await oneToOneGet(instance, relationshipMetadata, {
        loadFromDatastore: false,
      })
      if (relation !== undefined) {
        const relationConstructor = getConstructor(relation)
        const relationRepository = getRepository(relationConstructor)
        await relationRepository.delete(relation)
      }
    } catch (e) {
      if (!(e instanceof MissingRelationshipError)) throw e
      alreadyDeleted = true
    }
  }

  if (!alreadyDeleted) {
    const keyGenerator = (): Key =>
      generateOneRelationshipKey(instance, relationshipMetadata)
    cache.delete(instance, keyGenerator)
  }
}
