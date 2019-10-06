import './metadata'

import { Key } from './Datastore'
import {
  BaseEntity,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from './Entity'
import { generatePropertyKey } from './utils/keyGeneration'

export type ColumnValue = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type ColumnKey = string

export const COLUMNS_ON_ENTITY_KEY = Symbol(`columnOnEntity`)
export const COLUMN_METADATA_KEY = Symbol(`columnMetadata`)

export interface CachedValue {
  isDirty?: boolean
  cachedValue?: ColumnValue
}

export interface ColumnMetadata {
  key: Key
  property: ColumnKey
  isPrimary?: boolean
  isIndexable?: boolean
  cachedValues: Map<BaseEntity, CachedValue>
}

interface ColumnOptions {
  key?: Key
  isPrimary?: boolean
  isIndexable?: boolean
}

// TODO: Stop overriding with constructor values if reloading
export function Column(options: ColumnOptions = {}) {
  return (instance: BaseEntity, property: ColumnKey): void => {
    // TOOD: Throw error if key already in use.
    const columnMetadata: ColumnMetadata = {
      key: options.key || property,
      property,
      isIndexable: options.isIndexable,
      isPrimary: options.isPrimary,
      cachedValues: new Map<BaseEntity, {}>([
        [
          instance,
          {
            isDirty: false,
            cachedValue: undefined,
          },
        ],
      ]),
    }

    Reflect.defineMetadata(
      COLUMN_METADATA_KEY,
      columnMetadata,
      instance,
      property
    )

    const columnsOnEntity =
      Reflect.getMetadata(COLUMNS_ON_ENTITY_KEY, instance) || []

    columnsOnEntity.push(property)
    Reflect.defineMetadata(COLUMNS_ON_ENTITY_KEY, columnsOnEntity, instance)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      get: async function get(this: BaseEntity) {
        const { datastore } = Reflect.getMetadata(
          ENTITY_METADATA_KEY,
          instance.constructor
        ) as EntityConstructorMetadata
        const columnMetadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY,
          instance,
          property
        ) as ColumnMetadata
        const cachedValue = (columnMetadata.cachedValues.get(this) || {
          isDirty: false,
          cachedValue: undefined,
        }) as CachedValue

        if (cachedValue.cachedValue === undefined) {
          cachedValue.cachedValue = await datastore.read(
            await generatePropertyKey(datastore, instance, columnMetadata)
          )
        }

        return cachedValue.cachedValue
      },
      set: async function set(this: BaseEntity, value: ColumnValue) {
        const columnMetadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY,
          this,
          property
        ) as ColumnMetadata
        const cachedValue = (columnMetadata.cachedValues.get(this) || {
          isDirty: false,
          cachedValue: undefined,
        }) as CachedValue

        cachedValue.cachedValue = value
        cachedValue.isDirty = true

        columnMetadata.cachedValues.set(this, cachedValue)
      },
    })
  }
}
