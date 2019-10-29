import { Value, Datastore, Key } from './Datastore'

export interface ReadOptions {
  skipCache?: boolean
}

export const databaseRead = async (
  datastore: Datastore,
  key: Key,
  { skipCache = false }: ReadOptions = {}
): Promise<Value> => {
  return await datastore._read(key)
}
