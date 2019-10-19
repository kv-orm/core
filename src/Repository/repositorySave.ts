import { Datastore } from '../Datastore/Datastore'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { ColumnMetadata, CachedValue } from '../Column/Column'
import {
  generateIndexablePropertyKey,
  generatePropertyKey,
} from '../utils/keyGeneration'
import { getPrimaryColumnValue, getColumns, setColumn } from '../utils/columns'
import { ColumnMetadataError } from '../utils/errors'
import { getDatastore } from '../utils/datastore'

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
    await saveIndexableProperty(datastore, instance, columnMetadata)
  }

  const key = await generatePropertyKey(datastore, instance, columnMetadata)
  const cachedValue = columnMetadata.cachedValues.get(instance)
  if (cachedValue === undefined) {
    throw new ColumnMetadataError(
      instance,
      columnMetadata,
      `Entity instance's property has no cached value.`
    )
  }
  const value = cachedValue.cachedValue
  await datastore.write(key, value)
  return Promise.resolve(true)
}

export const repositorySave = async (
  constructor: EntityConstructor<BaseEntity>,
  instance: BaseEntity
): Promise<boolean> => {
  const datastore = getDatastore(constructor)
  const columns = getColumns(instance)
  const dirtyColumns = columns.filter(
    column => (column.cachedValues.get(instance) || {}).isDirty
  )

  if (dirtyColumns.length === 0) return Promise.resolve(false)

  for (const column of dirtyColumns) {
    await saveProperty(datastore, instance, column)
    const cachedValue = column.cachedValues.get(instance) as CachedValue
    cachedValue.isDirty = false
    setColumn(instance, column)
  }

  return Promise.resolve(true)
}
