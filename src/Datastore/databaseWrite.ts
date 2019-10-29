import { Value, Datastore, Key } from './Datastore'

export interface WriteOptions {
  skipCache?: boolean
}

export const databaseWrite = async (
  datastore: Datastore,
  key: Key,
  value: Value,
  { skipCache = false }: WriteOptions = {}
): Promise<Value> => {
  return await datastore._write(key, value)
}
