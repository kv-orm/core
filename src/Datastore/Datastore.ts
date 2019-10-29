import { databaseRead, ReadOptions } from './databaseRead'
import { databaseWrite } from './databaseWrite'
import { databaseDelete } from './databaseDelete'
import {
  SearchOptions,
  databaseSearch,
  SearchResult,
  SearchStrategy,
} from './databaseSearch'

export type Value = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type Key = string

interface DatastoreOptions {
  keySeparator?: string
  cache?: Datastore
}

export abstract class Datastore {
  public abstract searchStrategies: SearchStrategy[]
  public readonly keySeparator: Key
  public readonly cache: Datastore | undefined
  private cacheMetadata = {
    dirtyKeys: [],
  }

  // TODO: Lock down control access
  public abstract _read(key: Key): Promise<Value>
  public abstract _write(key: Key, value: Value): Promise<void>
  public abstract _delete(key: Key): Promise<void>
  public abstract _search(options: SearchOptions): Promise<SearchResult>

  public read(key: Key, options?: ReadOptions): Promise<Value> {
    return databaseRead(this, key, options)
  }

  // TODO: Make sync
  public write(key: Key, value: Value, options = {}): Promise<void> {
    return databaseWrite(this, key, value, options)
  }

  public delete(key: Key, options = {}): Promise<void> {
    return databaseDelete(this, key, options)
  }

  public search(options: SearchOptions): Promise<SearchResult> {
    this.assertSearchStrategyIsValid(options.strategy)
    return databaseSearch(this, options)
  }

  protected assertSearchStrategyIsValid = (strategy: SearchStrategy): void => {
    if (!(strategy in this.searchStrategies))
      throw new Error(
        `Search strategy, ${SearchStrategy[strategy]}, is not implemented on this type of Datastore.`
      )
  }

  public constructor({
    keySeparator = `:`,
    cache = undefined,
  }: DatastoreOptions = {}) {
    this.keySeparator = keySeparator
    this.cache = cache
  }
}
