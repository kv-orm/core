import { Cache } from '../Cache/Cache'

export type Value = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type Key = string

interface DatastoreOptions {
  keySeparator?: string
  cache?: Cache
}

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

export abstract class Datastore {
  public abstract searchStrategies: SearchStrategy[]
  public readonly keySeparator: Key
  public readonly cache: Cache

  protected abstract _read(key: Key): Promise<Value> | Value
  protected abstract _write(key: Key, value: Value): Promise<void>
  protected abstract _delete(key: Key): Promise<void>
  protected abstract _search(options: SearchOptions): Promise<SearchResult>

  public read(key: Key): Promise<Value> {
    return this._read(key)
  }

  public write(key: Key, value: Value): Promise<void> {
    return this._write(key, value)
  }

  public delete(key: Key): Promise<void> {
    return this._delete(key)
  }

  public search(options: SearchOptions): Promise<SearchResult> {
    this.assertSearchStrategyIsValid(options.strategy)
    return this._search(options)
  }

  protected assertSearchStrategyIsValid = (strategy: SearchStrategy): void => {
    if (!(strategy in this.searchStrategies))
      throw new Error(
        `Search Strategy, ${SearchStrategy[strategy]}, is not implemented on this type of Datastore.`
      )
  }

  public constructor({
    keySeparator = `:`,
    cache = new Cache(),
  }: DatastoreOptions = {}) {
    this.keySeparator = keySeparator
    this.cache = cache
  }
}
