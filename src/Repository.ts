import {
  BaseEntity,
  EntityConstructor,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from './Entity'
import { getColumns } from './utils/columns'
import { ColumnMetadata, COLUMN_METADATA_KEY } from './Column'
import { generatePropertyKey } from './utils/keyGeneration'
import { Datastore } from './Datastore'

export interface Repository {
  // find(): Promise<BaseEntity[]>
  // findOne(): Promise<BaseEntity>
  save(entity: BaseEntity): Promise<boolean>
}

const saveProperty = async (
  datastore: Datastore,
  instance: BaseEntity,
  column: ColumnMetadata
): Promise<boolean> => {
  const key = await generatePropertyKey(datastore, instance, column.property)
  datastore.write(
    key,
    Reflect.getMetadata(COLUMN_METADATA_KEY, instance).get(column.property)
      .cachedValue
  )
  return Promise.resolve(true)
}

export const getRepository = (
  constructor: EntityConstructor<BaseEntity>
): Repository => {
  return {
    // find(): Promise<BaseEntity[]> {
    //   // TODO
    //   return Promise.resolve([constructor])
    // },
    // findOne(): Promise<BaseEntity> {
    //   // TODO
    //   return Promise.resolve(constructor)
    // },
    async save(instance: BaseEntity): Promise<boolean> {
      // TODO
      const { datastore } = Reflect.getMetadata(
        ENTITY_METADATA_KEY,
        constructor
      ) as EntityConstructorMetadata

      const columns = Reflect.getMetadata(COLUMN_METADATA_KEY, instance)
      const dirtyColumns = [...columns.values()].filter(
        ({ isDirty }) => isDirty
      )

      if (dirtyColumns.length === 0) return Promise.resolve(false)

      for (const column of dirtyColumns) {
        await saveProperty(datastore, instance, column)
        column.isDirty = false
        columns.set(column.property, column)
      }

      Reflect.defineMetadata(COLUMN_METADATA_KEY, instance, columns)

      return Promise.resolve(true)
    },
  }
}
