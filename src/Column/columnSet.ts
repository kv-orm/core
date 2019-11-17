import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './Column'
import { Key, Value } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entity'
import { getDatastore } from '../utils/datastore'
import { getCache } from '../utils/cache'
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
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)

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
