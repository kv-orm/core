import { BaseEntity } from '../Entity'
import { ColumnMetadata, COLUMN_METADATA_KEY } from '../Column'

export const getColumns = (instance: BaseEntity): ColumnMetadata[] => {
  return Reflect.getMetadata(COLUMN_METADATA_KEY, instance).values()
}

export const getPrimaryColumn = (
  instance: BaseEntity
): ColumnMetadata | undefined => {
  return [...getColumns(instance)].find(({ isPrimary }) => isPrimary)
}
