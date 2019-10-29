import { Value, Datastore, Key } from './Datastore'

export interface ReadOptions {
  skipCache?: boolean
}

export const databaseRead = async (
  datastore: Datastore,
  key: Key,
  { skipCache = false }: ReadOptions = {}
): Promise<Value> => {
  if (datastore.cache === undefined) return await datastore._read(key)
  let value: Value
  if (!skipCache) {
    value = await datastore.cache._read(key)
    if (value !== null) return value
  }
  value = await datastore._read(key)
  await datastore.cache._write(key, value)
  return value
}
