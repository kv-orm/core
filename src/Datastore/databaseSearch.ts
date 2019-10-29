import { Datastore, Key } from './Datastore'

export type Cursor = string

export enum SearchStrategy {
  prefix,
}

export interface SearchOptions {
  term: Key
  strategy: SearchStrategy
  first?: number
  after?: Cursor
}

export interface SearchResult {
  keys: Key[]
  hasNextPage: boolean
  cursor: Cursor
}

export const databaseSearch = async (
  datastore: Datastore,
  options: SearchOptions
): Promise<SearchResult> => {
  return await datastore._search(options)
}
