import { BaseEntity } from '../Entity/Entity'
import { getColumnMetadatas } from '../utils/columns'
import { repositorySave } from './repositorySave'
import { columnDelete } from '../Column/columnDelete'
import { getConstructorDatastoreCache } from '../utils/entities'
import { getRelationshipMetadatas } from '../utils/relationships'
import { RelationshipType } from '../Relationship/relationshipMetadata'
import { oneToOneDelete } from '../Relationship/oneToOneDelete'
import { Instruction } from '../Instruction/Instruction'
import { EntityNotFoundError } from './EntityNotFoundError'

export const repositoryDelete = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)
  const columnMetadatas = getColumnMetadatas(constructor)
  const relationshipMetadatas = getRelationshipMetadatas(constructor)

  for (const relationshipMetadata of relationshipMetadatas) {
    switch (relationshipMetadata.type) {
      case RelationshipType.OneToOne:
        try {
          await oneToOneDelete(instance, relationshipMetadata)
        } catch (e) {
          if (!(e instanceof EntityNotFoundError)) throw e
        }
        break
      case RelationshipType.OneToMany:
        // TODO
        break
    }
  }

  for (const columnMetadata of columnMetadatas.filter(
    ({ isPrimary }) => !isPrimary
  )) {
    await columnDelete(instance, columnMetadata)
  }

  for (const columnMetadata of columnMetadatas.filter(
    ({ isPrimary }) => isPrimary
  )) {
    await columnDelete(instance, columnMetadata)
  }

  console.log(cache.instructions)

  if (await repositorySave(instance)) {
    cache.setPrimaryColumnValue(instance, null)
    return true
  }
  return false
}
