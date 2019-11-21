import { BaseEntity } from '../Entity/Entity'
import { getConstructorDatastoreCache } from '../utils/entities'
import { getRelationshipMetadatas } from '../utils/relationships'
import { RelationshipType } from '../Relationship/relationshipMetadata'
import { oneToOneGet } from '../Relationship/oneToOneGet'
import { EntityNotFoundError } from './EntityNotFoundError'
import { MissingRelationshipError } from '../Relationship/MissingRelationshipError'

export const repositorySave = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)

  const relationshipMetadatas = getRelationshipMetadatas(constructor)
  for (const relationshipMetadata of relationshipMetadatas) {
    if (relationshipMetadata.cascade.onSave) {
      switch (relationshipMetadata.type) {
        case RelationshipType.OneToOne:
          try {
            const relation = await oneToOneGet(instance, relationshipMetadata)
            await repositorySave(relation)
          } catch (e) {
            if (
              !(
                e instanceof EntityNotFoundError ||
                e instanceof MissingRelationshipError
              )
            )
              throw e
          }

          break
        // TODO: OneToMany
      }
    }
  }

  return cache.sync(instance)
}
