import '../metadata'

import { Key } from '../Datastore/Datastore'
import { BaseEntity } from '../Entity/Entity'
import { ColumnSetupError } from './ColumnSetupError'
import { getConstantColumns, setColumn } from '../utils/columns'
import { getEntityConstructor } from '../utils/entity'
import { columnGet } from './columnGet'
import { columnSet } from './columnSet'

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
  const constantColumns = getConstantColumns(getEntityConstructor(instance))
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

export const newDefaultCachedValue = (): CachedValue => ({
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

    // Set Constant Column
    const constructor = getEntityConstructor(instance)
    const constantColumns = getConstantColumns(constructor)
    constantColumns.push(constantColumnMetadata)
    Reflect.defineMetadata(COLUMNS_ON_ENTITY_KEY, constantColumns, constructor)

    // Set Column
    const columnMetadata: ColumnMetadata = {
      ...constantColumnMetadata,
      cachedValues: new Map<BaseEntity, {}>([
        [instance, newDefaultCachedValue()],
      ]),
    }
    setColumn(instance, columnMetadata)

    // Override Property
    Reflect.defineProperty(instance, property, {
      enumerable: true,
      get: async function get(this: BaseEntity) {
        return await columnGet(this, property)
      },
      set: async function set(this: BaseEntity, value: ColumnValue) {
        return await columnSet(this, property, value)
      },
    })
  }
}
