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
} from '../Column/Column'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from '../utils/keyGeneration'
import { Datastore, Value } from '../Datastore/Datastore'
import {
  getColumns,
  setPrimaryColumnValue,
  getPrimaryColumnValue,
  getPrimaryColumn,
} from '../utils/columns'
import { ColumnMetadataError } from '../utils/errors'
import { RepositoryLoadError } from './RepositoryLoadError'

export interface Repository {
  load(identifier?: Value): Promise<BaseEntity>
  save(entity: BaseEntity): Promise<boolean>
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

export const getRepository = (
  constructor: EntityConstructor<BaseEntity>
): Repository => {
  return {
    async load(identifier?: Value): Promise<BaseEntity> {
      const instance = Object.create(constructor.prototype)

      const primaryColumn = getPrimaryColumn(instance)
      if (primaryColumn === undefined && identifier !== undefined) {
        throw new RepositoryLoadError(
          instance.constructor,
          `Entity is a singleton, so cannot load with an identifier.`
        )
      } else if (primaryColumn !== undefined && identifier === undefined) {
        throw new RepositoryLoadError(
          instance.constructor,
          `Entity is not a singleton, and so requires an identifier to load with.`
        )
      }

      if (identifier !== undefined) {
        setPrimaryColumnValue(instance, identifier)
      }
      return instance
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
  }
}
