export type Value = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type Key = string
export type Cursor = string

export enum SearchStrategy {
  prefix,
}

export type SearchOptions = {
  term: Key
  strategy: SearchStrategy
  first?: number
  after?: Cursor
}

export type SearchResult = {
  keys: Key[]
  hasNextPage: boolean
  cursor: Cursor
}

export abstract class Datastore {
  public abstract searchStrategies: SearchStrategy[]
  public readonly keySeparator: Key

  abstract read(key: Key): Promise<Value>
  abstract write(key: Key, value: Value): Promise<void>
  abstract delete(key: Key): Promise<void>
  abstract search(options: SearchOptions): Promise<SearchResult>

  protected assertSearchStrategyIsValid = (strategy: SearchStrategy): void => {
    if (!(strategy in this.searchStrategies))
      throw new Error(
        `Search strategy, ${SearchStrategy[strategy]}, is not implemented.`
      )
  }

  public constructor(keySeparator = `:`) {
    this.keySeparator = keySeparator
  }
}
