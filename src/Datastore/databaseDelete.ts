import { Datastore, Key } from './Datastore'

export const databaseDelete = async (
  datastore: Datastore,
  key: Key,
  {}
): Promise<void> => {
  if (datastore.cache !== undefined) await datastore.cache._delete(key)
  return await datastore._delete(key)
}
