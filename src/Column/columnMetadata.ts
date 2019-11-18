import { Key } from '../Datastore/Datastore'
import { ColumnKey } from './Column'

export interface ColumnMetadata {
  key: Key
  property: ColumnKey
  isPrimary?: boolean
  isIndexable?: boolean
}

export const createColumnMetadata = ({
  options: { key, isIndexable, isPrimary },
  property,
}: {
  options: { key?: string; isIndexable?: boolean; isPrimary?: boolean }
  property: ColumnKey
}): ColumnMetadata => ({
  key: key || property.toString(),
  property,
  isIndexable: !!isIndexable,
  isPrimary: !!isPrimary,
})
