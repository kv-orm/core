import '../metadata'

import { Datastore, Key } from '../Datastore'
import { BaseEntity, ENTITY_METADATA_KEY } from '../Entity'
import { CachedValue, ColumnMetadata } from '../Column'
import { getPrimaryColumn } from './columns'

const getInstanceKey = (instance: BaseEntity): Key =>
  Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor).key

const getPropertyValue = async (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<Key> => await instance[columnMetadata.property]

// Author:UUID-HERE:name
// or, if singleton, ApplicationConfiguration:password
export const generatePropertyKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<Key> => {
  const items = [getInstanceKey(instance)]
  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn) {
    items.push(
      (primaryColumn.cachedValues.get(instance) as CachedValue).cachedValue
    )
  }

  items.push(columnMetadata.key)

  return items.join(datastore.keySeparator)
}

// Author:email:abc@xyz.com
export const generateIndexablePropertyKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<Key> =>
  [
    Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor).key,
    columnMetadata.key,
    await getPropertyValue(instance, columnMetadata),
  ].join(datastore.keySeparator)

// UUID-HERE
// or, if singleton, ApplicationConfiguration
const generateRelationshipKey = async (instance: BaseEntity): Promise<Key> => {
  const { key } = Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor)

  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn) {
    return await getPropertyValue(instance, primaryColumn)
  }

  return key
}

// Author:UUID-HERE:passport
export const generateOneRelationshipKey = generatePropertyKey

// Author:UUID-HERE:books:UUID-HERE
export const generateManyRelationshipKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  columnMetadata: ColumnMetadata,
  relationshipInstance: BaseEntity
): Promise<Key> => {
  return [
    await generatePropertyKey(datastore, instance, columnMetadata),
    await generateRelationshipKey(relationshipInstance),
  ].join(datastore.keySeparator)
}
