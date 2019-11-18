import '../metadata'

import { Key } from '../Datastore/Datastore'
import { BaseEntity, EntityConstructor, PropertyValue } from '../Entity/Entity'
import { setColumnMetadata, getColumnMetadatas } from '../utils/columns'
import { getConstructor } from '../utils/entities'
import { columnGet } from './columnGet'
import { columnSet } from './columnSet'
import { ColumnSetupError } from './ColumnSetupError'
import { ColumnMetadata, createColumnMetadata } from './columnMetadata'

export const COLUMN_KEY = Symbol(`Column`)

interface ColumnOptions {
  key?: Key
  isPrimary?: boolean
  isIndexable?: boolean
}

const assertKeyNotInUse = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata
): void => {
  const constantColumns = getColumnMetadatas(constructor)
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
    const columnMetadata: ColumnMetadata = createColumnMetadata({
      options,
      property,
    })

    const constructor = getConstructor(instance)
    assertKeyNotInUse(constructor, columnMetadata)
    setColumnMetadata(constructor, columnMetadata)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return await columnGet(this, columnMetadata)
      },
      set: function set(this: BaseEntity, value: PropertyValue) {
        columnSet(this, columnMetadata, value)
      },
    })
  }
}
