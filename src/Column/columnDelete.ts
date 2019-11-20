import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './columnMetadata'
import { Key } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from '../utils/keyGeneration'

export const columnDelete = (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): void => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)

  if (columnMetadata.isIndexable) {
    const indexableKeyGenerator = async (): Promise<Key> =>
      generateIndexablePropertyKey(
        constructor,
        columnMetadata,
        await instance[columnMetadata.property.toString()]
      )
    cache.delete(instance, indexableKeyGenerator)
  }

  const keyGenerator = (): Promise<Key> =>
    Promise.resolve(generatePropertyKey(instance, columnMetadata))
  cache.delete(instance, keyGenerator)
}
