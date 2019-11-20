import { BaseEntity } from '../Entity/Entity'
import { getColumnMetadatas } from '../utils/columns'
import { repositorySave } from './repositorySave'
import { columnDelete } from '../Column/columnDelete'
import { getConstructor } from '../utils/entities'

// TODO: Cascading relationships
export const repositoryDelete = async (
  instance: BaseEntity
): Promise<boolean> => {
  const constructor = getConstructor(instance)
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

  // TODO: Remove from cache primaryValues

  return repositorySave(instance)
}
