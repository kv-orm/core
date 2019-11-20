import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './columnMetadata'
import { Key } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from '../utils/keyGeneration'
import { columnGet } from './columnGet'

export const columnDelete = async (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<void> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)

  if (columnMetadata.isIndexable) {
    const value = await columnGet(instance, columnMetadata)
    const indexableKeyGenerator = (): Key =>
      generateIndexablePropertyKey(constructor, columnMetadata, value)
    cache.delete(instance, indexableKeyGenerator)
  }

  const keyGenerator = (): Key => generatePropertyKey(instance, columnMetadata)
  cache.delete(instance, keyGenerator)
}
