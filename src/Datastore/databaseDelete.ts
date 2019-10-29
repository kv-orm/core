import { Value, Datastore, Key } from './Datastore'

export interface DeleteOptions {
  skipCache?: boolean
}

export const databaseDelete = async (
  datastore: Datastore,
  key: Key,
  { skipCache = false }: DeleteOptions = {}
): Promise<Value> => {
  return await datastore._delete(key)
}
