import '../metadata'

import { Key } from '../Datastore'
import {
  BaseEntity,
  ENTITY_METADATA_KEY,
  EntityConstructorMetadata,
} from '../Entity'
import { generatePropertyKey } from '../utils/keyGeneration'
import { ColumnSetupError } from './ColumnSetupError'
import { getConstantColumns } from '../utils/columns'

export type ColumnValue = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type ColumnKey = string

export const COLUMNS_ON_ENTITY_KEY = Symbol(`columnOnEntity`)
export const COLUMN_METADATA_KEY = Symbol(`columnMetadata`)

export interface ConstantColumnMetadata {
  key: Key
  property: ColumnKey
  isPrimary?: boolean
  isIndexable?: boolean
}

export interface CachedValue {
  isDirty?: boolean
  cachedValue?: ColumnValue
}

export interface ColumnMetadata extends ConstantColumnMetadata {
  cachedValues: Map<BaseEntity, CachedValue>
}

interface ColumnOptions {
  key?: Key
  isPrimary?: boolean
  isIndexable?: boolean
}

const assertKeyNotInUse = (
  constantColumnMetadata: ConstantColumnMetadata,
  instance: BaseEntity
): void => {
  const constantColumns = getConstantColumns(instance)
  const keysInUse = constantColumns.map(
    constantColumnMetadata => constantColumnMetadata.key
  )

  if (keysInUse.indexOf(constantColumnMetadata.key) !== -1)
    throw new ColumnSetupError(
      instance,
      constantColumnMetadata,
      `Key is already in use`
    )
}

const newDefaultCachedValue = (): CachedValue => ({
  isDirty: false,
  cachedValue: undefined,
})

export function Column(options: ColumnOptions = {}) {
  return (instance: BaseEntity, property: ColumnKey): void => {
    const constantColumnMetadata: ConstantColumnMetadata = {
      key: options.key || property,
      property,
      isIndexable: options.isIndexable,
      isPrimary: options.isPrimary,
    }

    assertKeyNotInUse(constantColumnMetadata, instance)

    const columnMetadata: ColumnMetadata = {
      ...constantColumnMetadata,
      cachedValues: new Map<BaseEntity, {}>([
        [instance, newDefaultCachedValue()],
      ]),
    }

    // Set Column
    Reflect.defineMetadata(
      COLUMN_METADATA_KEY,
      columnMetadata,
      instance,
      property
    )

    // Set Constant Column
    const constantColumns = getConstantColumns(instance)
    constantColumns.push(constantColumnMetadata)
    Reflect.defineMetadata(COLUMNS_ON_ENTITY_KEY, constantColumns, instance)

    // Override Property
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
        const cachedValue =
          columnMetadata.cachedValues.get(this) || newDefaultCachedValue()

        if (cachedValue.cachedValue === undefined) {
          cachedValue.cachedValue = await datastore.read(
            await generatePropertyKey(datastore, this, columnMetadata)
          )
        }

        columnMetadata.cachedValues.set(this, cachedValue)

        return cachedValue.cachedValue
      },
      set: async function set(this: BaseEntity, value: ColumnValue) {
        const columnMetadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY,
          this,
          property
        ) as ColumnMetadata
        const cachedValue =
          columnMetadata.cachedValues.get(this) || newDefaultCachedValue()

        cachedValue.cachedValue = value
        cachedValue.isDirty = true

        columnMetadata.cachedValues.set(this, cachedValue)
      },
    })
  }
}
