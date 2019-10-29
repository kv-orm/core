import { databaseRead, ReadOptions } from './databaseRead'
import { databaseWrite, WriteOptions } from './databaseWrite'
import { databaseDelete, DeleteOptions } from './databaseDelete'
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
  protected cache: Datastore | undefined

  abstract _read(key: Key): Promise<Value>
  abstract _write(key: Key, value: Value): Promise<void>
  abstract _delete(key: Key): Promise<void>
  abstract _search(options: SearchOptions): Promise<SearchResult>

  public read(key: Key, options?: ReadOptions): Promise<Value> {
    return databaseRead(this, key, options)
  }

  public write(key: Key, value: Value, options?: WriteOptions): Promise<Value> {
    return databaseWrite(this, key, value, options)
  }

  public delete(key: Key, options?: DeleteOptions): Promise<Value> {
    return databaseDelete(this, key, options)
  }

  public search(options: SearchOptions): Promise<SearchResult> {
    this.assertSearchStrategyIsValid(options.strategy)
    return databaseSearch(this, options)
  }

  protected assertSearchStrategyIsValid = (strategy: SearchStrategy): void => {
    if (!(strategy in this.searchStrategies))
      throw new Error(
        `Search strategy, ${SearchStrategy[strategy]}, is not implemented.`
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
