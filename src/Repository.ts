import {
  BaseEntity,
  EntityConstructor,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from './Entity'
import { ColumnMetadata, COLUMN_METADATA_KEY, CachedValue } from './Column'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from './utils/keyGeneration'
import { Datastore, Value } from './Datastore'
import {
  getColumns,
  setPrimaryColumnValue,
  getPrimaryColumn,
  getPrimaryColumnValue,
} from './utils/columns'

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
    saveIndexableProperty(datastore, instance, columnMetadata)
  }

  const key = await generatePropertyKey(datastore, instance, columnMetadata)
  const value = Reflect.getMetadata(
    COLUMN_METADATA_KEY,
    instance,
    columnMetadata.property
  ).cachedValues.get(instance).cachedValue
  await datastore.write(key, value)
  return Promise.resolve(true)
}

export const getRepository = (
  constructor: EntityConstructor<BaseEntity>
): Repository => {
  return {
    async load(identifier?: Value): Promise<BaseEntity> {
      const instance = Object.create(constructor.prototype)

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
        const c = column.cachedValues.get(instance) as CachedValue
        c.isDirty = false
      }

      Reflect.defineMetadata(COLUMN_METADATA_KEY, instance, columns)

      return Promise.resolve(true)
    },
  }
}
