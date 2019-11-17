import '../metadata'

import { Key } from '../Datastore/Datastore'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { setColumn, getColumns } from '../utils/columns'
import { getConstructor } from '../utils/entity'
import { columnGet } from './columnGet'
import { columnSet } from './columnSet'
import { ColumnSetupError } from './ColumnSetupError'

export type ColumnValue = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type ColumnKey = string | number | symbol

export const COLUMN_KEY = Symbol(`Column`)

export interface ColumnMetadata {
  key: Key
  property: ColumnKey
  isPrimary?: boolean
  isIndexable?: boolean
}

interface ColumnOptions {
  key?: Key
  isPrimary?: boolean
  isIndexable?: boolean
}

const assertKeyNotInUse = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata
): void => {
  const constantColumns = getColumns(constructor)
  const keysInUse = constantColumns.map(columnMetadata => columnMetadata.key)

  if (keysInUse.indexOf(columnMetadata.key) !== -1)
    throw new ColumnSetupError(
      constructor,
      columnMetadata,
      `Key is already in use`
    )
}

export const Column = <T extends BaseEntity>(options: ColumnOptions = {}) => {
  return (instance: T, property: keyof T): void => {
    const columnMetadata: ColumnMetadata = {
      key: options.key || property.toString(),
      property,
      isIndexable: options.isIndexable,
      isPrimary: options.isPrimary,
    }

    const constructor = getConstructor(instance)
    assertKeyNotInUse(constructor, columnMetadata)
    setColumn(constructor, columnMetadata)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return await columnGet(this, columnMetadata)
      },
      set: function set(this: BaseEntity, value: ColumnValue) {
        columnSet(this, columnMetadata, value)
      },
    })
  }
}
