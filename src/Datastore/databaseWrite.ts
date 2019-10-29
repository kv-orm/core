import { Value, Datastore, Key } from './Datastore'

export const databaseWrite = async (
  datastore: Datastore,
  key: Key,
  value: Value,
  {}
): Promise<void> => {
  if (datastore.cache !== undefined) await datastore.cache._write(key, value)
  return await datastore._write(key, value)
}
