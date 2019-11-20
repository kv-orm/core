import { BaseEntity } from '../Entity/Entity'
import { getColumnMetadatas } from '../utils/columns'
import { repositorySave } from './repositorySave'
import { columnDelete } from '../Column/columnDelete'
import { getConstructorDatastoreCache } from '../utils/entities'

// TODO: Cascading relationships
export const repositoryDelete = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)
  const columnMetadatas = getColumnMetadatas(constructor)

  for (const columnMetadata of columnMetadatas.filter(
    ({ isIndexable }) => isIndexable
  )) {
    await columnDelete(instance, columnMetadata)
  }

  for (const columnMetadata of columnMetadatas.filter(
    ({ isIndexable }) => !isIndexable
  )) {
    await columnDelete(instance, columnMetadata)
  }

  if (await repositorySave(instance)) {
    cache.setPrimaryColumnValue(instance, null)
    return true
  }
  return false
}
