import '../metadata'

import { Datastore, Key, Value } from '../Datastore/Datastore'
import {
  BaseEntity,
  ENTITY_METADATA_KEY,
  EntityConstructor,
  EntityConstructorMetadata,
} from '../Entity/Entity'
import {
  ColumnMetadata,
  ColumnValue,
  ColumnKey,
  ConstantColumnMetadata,
} from '../Column/Column'
import { getPrimaryColumn } from './columns'
import { EntityMetadataError, ColumnMetadataError } from './errors'

// TODO: Look at the difference of using the cached Primary Column Value vs. looking it up with getPropertyValue

const getInstanceKey = (instance: BaseEntity): Key => {
  const entityMetadata = Reflect.getMetadata(
    ENTITY_METADATA_KEY,
    instance.constructor
  )

  if (entityMetadata === undefined) {
    throw new EntityMetadataError(
      instance.constructor as EntityConstructor<BaseEntity>,
      `Could not find metadata. Has it been defined yet?`
    )
  }

  return entityMetadata.key
}

const getPrimaryColumnCachedValue = (
  primaryColumn: ColumnMetadata,
  instance: BaseEntity
): ColumnValue => {
  const cachedValue = primaryColumn.cachedValues.get(instance)

  if (cachedValue === undefined) {
    throw new ColumnMetadataError(
      instance,
      primaryColumn,
      `Primary Column has no value`
    )
  }

  return cachedValue.cachedValue
}

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
    const primaryColumnCachedValue = getPrimaryColumnCachedValue(
      primaryColumn,
      instance
    )

    if (primaryColumnCachedValue === undefined) {
      throw new ColumnMetadataError(
        instance,
        primaryColumn,
        `Primary Column value is undefined. Did the repository load fail somehow?`
      )
    }

    items.push(primaryColumnCachedValue)
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
    getInstanceKey(instance),
    columnMetadata.key,
    await getPropertyValue(instance, columnMetadata),
  ].join(datastore.keySeparator)

export const generateIndexablePropertySearchKey = async (
  datastore: Datastore,
  constructor: EntityConstructor<BaseEntity>,
  indexableProperty: ConstantColumnMetadata,
  identifier: Value
): Promise<Key> => {
  const entityMetadata = Reflect.getMetadata(
    ENTITY_METADATA_KEY,
    constructor
  ) as EntityConstructorMetadata
  if (entityMetadata === undefined) {
    throw new EntityMetadataError(constructor) // TODO
  }

  return [entityMetadata.key, indexableProperty.key, identifier].join(
    datastore.keySeparator
  )
}

// UUID-HERE
// or, if singleton, ApplicationConfiguration
const generateRelationshipKey = async (
  datastore: Datastore,
  instance: BaseEntity
): Promise<Key> => {
  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn) {
    return await getPropertyValue(instance, primaryColumn)
  }

  return getInstanceKey(instance)
}

// TODO: Probably want some sort of RelationshipMetadata object
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
    await generateRelationshipKey(datastore, relationshipInstance),
  ].join(datastore.keySeparator)
}
