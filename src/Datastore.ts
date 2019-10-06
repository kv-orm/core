export type Value = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type Key = string
export type Cursor = string

interface DatastoreOptions {
  keySeparator?: string
  cache?: Datastore
}

export enum SearchStrategy {
  prefix,
}

interface ReadOptions {
  skipCache?: boolean
}

interface WriteOptions {
  skipCache?: boolean
}

interface DeleteOptions {
  skipCache?: boolean
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

  protected cache: Datastore | undefined
  protected dirtyKeys: Key[] = []

  protected abstract _read(key: Key): Promise<Value>
  protected abstract _write(key: Key, value: Value): Promise<void>
  protected abstract _delete(key: Key): Promise<void>
  protected abstract _search(options: SearchOptions): Promise<SearchResult>

  public async read(
    key: Key,
    { skipCache = false }: ReadOptions = {}
  ): Promise<Value> {
    if (this.cache === undefined) {
      return await this._read(key)
    }
    let value: Value
    if (!skipCache) {
      value = await this.cache._read(key)
      if (value !== null) {
        return value
      }
    }
    value = await this._read(key)
    await this.cache._write(key, value)
    return value
  }
  public async write(
    key: Key,
    value: Value,
    { skipCache = false }: WriteOptions = {}
  ): Promise<void> {
    if (this.cache === undefined) {
      return await this._write(key, value)
    }
    if (!skipCache) {
      if ((await this.cache._read(key)) === value) {
        return Promise.resolve()
      }
    }
    await this.cache._write(key, value)
    return await this._write(key, value)
  }
  public async delete(
    key: Key,
    { skipCache = false }: DeleteOptions = {}
  ): Promise<void> {
    if (this.cache === undefined) {
      return await this._delete(key)
    }
    if (!skipCache) {
      if ((await this.cache.read(key)) === null) {
        return Promise.resolve()
      }
    }
    await this.cache._delete(key)
    return await this._delete(key)
  }
  public async search(options: SearchOptions): Promise<SearchResult> {
    return await this._search(options)
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
