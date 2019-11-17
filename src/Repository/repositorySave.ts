import { BaseEntity } from '../Entity/Entity'
import { getDatastore } from '../utils/datastore'
import { getConstructor } from '../utils/entity'
import { getCache } from '../utils/cache'

// const saveIndexableProperty = async (
//   instance: BaseEntity,
//   columnMetadata: ColumnMetadata
// ): Promise<boolean> => {
//   const constructor = getEntityConstructor(instance)
//   const datastore = getDatastore(constructor)
//   const key = await generateIndexablePropertyKey(instance, columnMetadata)
//   const value = getPrimaryColumnValue(instance)
//   await datastore.write(key, value)
//   return Promise.resolve(true)
// }

// const saveProperty = async (
//   instance: BaseEntity,
//   columnMetadata: ColumnMetadata
// ): Promise<boolean> => {
//   const constructor = getEntityConstructor(instance)
//   const datastore = getDatastore(constructor)

//   if (columnMetadata.isIndexable)
//     await saveIndexableProperty(instance, columnMetadata)

//   const key = generatePropertyKey(instance, columnMetadata)
//   const cachedValue = columnMetadata.cachedValues.get(instance)
//   if (cachedValue === undefined) {
//     throw new ColumnMetadataError(
//       instance,
//       columnMetadata,
//       `Entity instance's property has no cached value.`
//     )
//   }
//   const value = cachedValue.cachedValue
//   await datastore.write(key, value)
//   return Promise.resolve(true)
// }

export const repositorySave = async (
  instance: BaseEntity
): Promise<boolean> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)
  const cache = getCache(datastore)
  return cache.sync(instance)
}
