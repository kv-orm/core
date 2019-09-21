import { Datastore, Key } from '../Datastore'
import { BaseEntity, ENTITY_METADATA_KEY } from '../Entity'
import { ColumnKey, COLUMN_METADATA_KEY } from '../Column'
import { getPrimaryColumn } from './columns'

const getPropertyKey = (instance: BaseEntity, property: ColumnKey): Key =>
  Reflect.getMetadata(COLUMN_METADATA_KEY, instance).get(property).key

const getPropertyValue = async (
  instance: BaseEntity,
  property: ColumnKey
): Promise<Key> => await instance[property]

// Author:UUID-HERE:name
// or, if singleton, ApplicationConfiguration:password
export const generatePropertyKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  property: ColumnKey
): Promise<Key> => {
  const { key } = Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor)

  const items = [key]
  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn) {
    items.push(await getPropertyValue(instance, primaryColumn.property))
  }

  items.push(getPropertyKey(instance, property))

  return items.join(datastore.keySeparator)
}

// Author:email:abc@xyz.com
export const generateIndexablePropertyKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  property: ColumnKey
): Promise<Key> =>
  [
    Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor).key,
    getPropertyKey(instance, property),
    getPropertyValue(instance, property),
  ].join(datastore.keySeparator)

// UUID-HERE
// or, if singleton, ApplicationConfiguration
const generateRelationshipKey = async (instance: BaseEntity): Promise<Key> => {
  const { key } = Reflect.getMetadata(ENTITY_METADATA_KEY, instance.constructor)

  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn) {
    return await getPropertyValue(instance, primaryColumn.property)
  }

  return key
}

// Author:UUID-HERE:passport
export const generateOneRelationshipKey = generatePropertyKey

// Author:UUID-HERE:books:UUID-HERE
export const generateManyRelationshipKey = async (
  datastore: Datastore,
  instance: BaseEntity,
  property: ColumnKey,
  relationshipInstance: BaseEntity
): Promise<Key> => {
  return [
    await generatePropertyKey(datastore, instance, property),
    await generateRelationshipKey(relationshipInstance),
  ].join(datastore.keySeparator)
}
