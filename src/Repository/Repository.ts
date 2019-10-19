import '../metadata'

import {
  BaseEntity,
  EntityConstructor,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from '../Entity/Entity'
import {
  ColumnMetadata,
  COLUMN_METADATA_KEY,
  CachedValue,
  ColumnKey,
} from '../Column/Column'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
  generateIndexablePropertySearchKey,
} from '../utils/keyGeneration'
import { Datastore, Value } from '../Datastore/Datastore'
import {
  getColumns,
  getPrimaryColumnValue,
  getConstantColumns,
} from '../utils/columns'
import { ColumnMetadataError } from '../utils/errors'
import { RepositorySearchError } from './RepositorySearchError'
import { repositoryLoad } from './repositoryLoad'

export interface Repository {
  load(identifier?: Value): Promise<BaseEntity>
  save(entity: BaseEntity): Promise<boolean>
  search(property: ColumnKey, identifier: Value): Promise<BaseEntity | null>
}

const saveIndexableProperty = async (
  datastore: Datastore,
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<boolean> => {
  const key = await generateIndexablePropertyKey(
    datastore,
    instance,
    columnMetadata
  )
  const value = await getPrimaryColumnValue(instance)
  await datastore.write(key, value)
  return Promise.resolve(true)
}

const saveProperty = async (
  datastore: Datastore,
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<boolean> => {
  if (columnMetadata.isIndexable) {
    await saveIndexableProperty(datastore, instance, columnMetadata)
  }

  const key = await generatePropertyKey(datastore, instance, columnMetadata)
  const cachedValue = columnMetadata.cachedValues.get(instance)
  if (cachedValue === undefined) {
    throw new ColumnMetadataError(
      instance,
      columnMetadata,
      `Entity instance's property has no cached value.`
    )
  }
  const value = cachedValue.cachedValue
  await datastore.write(key, value)
  return Promise.resolve(true)
}

export const getRepository = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): Repository => {
  return {
    async load(identifier?: Value): Promise<T> {
      return await repositoryLoad(constructor, identifier)
    },
    async save(instance: BaseEntity): Promise<boolean> {
      const { datastore } = Reflect.getMetadata(
        ENTITY_METADATA_KEY,
        constructor
      ) as EntityConstructorMetadata

      const columns = getColumns(instance)
      const dirtyColumns = []
      for (const column of columns) {
        const cachedValue = column.cachedValues.get(instance) as CachedValue
        if (cachedValue.isDirty) {
          dirtyColumns.push(column)
        }
      }

      if (dirtyColumns.length === 0) return Promise.resolve(false)

      for (const column of dirtyColumns) {
        await saveProperty(datastore, instance, column)
        const cachedValue = column.cachedValues.get(instance) as CachedValue
        cachedValue.isDirty = false
      }

      Reflect.defineMetadata(COLUMN_METADATA_KEY, instance, columns)

      return Promise.resolve(true)
    },
    async search(property: ColumnKey, identifier: Value): Promise<T | null> {
      const { datastore } = Reflect.getMetadata(
        ENTITY_METADATA_KEY,
        constructor
      ) as EntityConstructorMetadata

      const columns = getConstantColumns(constructor)
      const indexableProperty = columns.find(
        column => column.property === property
      )

      if (indexableProperty === undefined)
        throw new RepositorySearchError(
          constructor,
          property,
          `Property is not indexable, or does not exist.`
        )

      const key = await generateIndexablePropertySearchKey(
        datastore,
        constructor,
        indexableProperty,
        identifier
      )
      const primaryIdentifier = await datastore.read(key)
      return await repositoryLoad(constructor, primaryIdentifier)
    },
  }
}
