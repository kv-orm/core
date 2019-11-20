import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from './columnMetadata'
import { Key, Value } from '../Datastore/Datastore'
import { getConstructorDatastoreCache } from '../utils/entities'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from '../utils/keyGeneration'
import { getPrimaryColumnValue, setPrimaryColumnValue } from '../utils/columns'
import { ReadOnlyError } from '../utils/errors'

export const columnSet = (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata,
  value: Value
): void => {
  const { constructor, cache } = getConstructorDatastoreCache(instance)

  if (columnMetadata.isPrimary) {
    let primaryColumnValue
    try {
      primaryColumnValue = getPrimaryColumnValue(instance)
    } catch {}
    if (primaryColumnValue !== undefined) {
      throw new ReadOnlyError(
        constructor,
        columnMetadata.property,
        value,
        `Primary Column Value has already been set`
      )
    }
    setPrimaryColumnValue(instance, value)
  }

  if (columnMetadata.isIndexable) {
    const indexableKeyGenerator = (): Promise<Key> =>
      Promise.resolve(
        generateIndexablePropertyKey(constructor, columnMetadata, value)
      )
    const primaryColumnValue = getPrimaryColumnValue(instance)
    cache.write(instance, indexableKeyGenerator, primaryColumnValue)
  }

  const keyGenerator = (): Promise<Key> =>
    Promise.resolve(generatePropertyKey(instance, columnMetadata))
  cache.write(instance, keyGenerator, value)
}
