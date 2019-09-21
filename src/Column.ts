import { Key } from './Datastore'
import {
  BaseEntity,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from './Entity'
import { generatePropertyKey } from './utils/keyGeneration'

export type ColumnValue = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type ColumnKey = string

export const COLUMN_METADATA_KEY = Symbol(`columnMetadata`)

export interface ColumnMetadata {
  key: Key
  property: ColumnKey
  isPrimary?: boolean
  isIndexable?: boolean
  isDirty?: boolean
  cachedValue?: ColumnValue
}

interface ColumnOptions {
  key?: Key
  isPrimary?: boolean
  isIndexable?: boolean
}

// TODO: Stop overriding with constructor values if reloading
export function Column(options: ColumnOptions = {}) {
  return (instance: BaseEntity, property: ColumnKey): void => {
    const columnMetadata =
      Reflect.getMetadata(COLUMN_METADATA_KEY, instance) ||
      new Map<ColumnKey, ColumnMetadata>()

    // TOOD: Throw error if key already in use.
    columnMetadata.set(property, {
      key: options.key || property,
      property,
      isIndexable: options.isIndexable,
      isPrimary: options.isPrimary,
      isDirty: false,
      cachedValue: undefined,
    })

    Reflect.defineMetadata(COLUMN_METADATA_KEY, columnMetadata, instance)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      get: async () => {
        const { datastore } = Reflect.getMetadata(
          ENTITY_METADATA_KEY,
          instance.constructor
        ) as EntityConstructorMetadata
        const columnMetadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY,
          instance
        ).get(property) as ColumnMetadata

        if (columnMetadata.cachedValue === undefined) {
          columnMetadata.cachedValue = await datastore.read(
            await generatePropertyKey(datastore, instance, columnMetadata.key)
          )
        }

        return columnMetadata.cachedValue
      },
      set: (value: ColumnValue) => {
        const columnMetadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY,
          instance
        ).get(property) as ColumnMetadata

        columnMetadata.cachedValue = value
        columnMetadata.isDirty = true
      },
    })
  }
}
