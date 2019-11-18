import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './columnMetadata'
import { Key, Value } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from '../utils/keyGeneration'
import { getPrimaryColumnValue, setPrimaryColumnValue } from '../utils/columns'

export const columnSet = (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata,
  value: Value
): void => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)

  if (columnMetadata.isPrimary) setPrimaryColumnValue(instance, value)

  if (columnMetadata.isIndexable) {
    const indexableKeyGenerator = (): Key =>
      generateIndexablePropertyKey(constructor, columnMetadata, value)
    const primaryColumnValue = getPrimaryColumnValue(instance)
    cache.write(instance, indexableKeyGenerator, primaryColumnValue)
  }

  const keyGenerator = (): Key => generatePropertyKey(instance, columnMetadata)
  cache.write(instance, keyGenerator, value)
}
