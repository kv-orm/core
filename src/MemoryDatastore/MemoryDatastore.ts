import {
  Datastore,
  Value,
  SearchStrategy,
  Key,
  SearchOptions,
  SearchResult,
  Cursor,
} from '../Datastore'

export class MemoryDatastore extends Datastore {
  private SEARCH_FIRST_LIMIT = 1000
  private SEARCH_FIRST_DEFAULT = 1000
  private data: Map<Key, Value> = new Map() // "remembers the original insertion order of the keys", https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

  public searchStrategies = [SearchStrategy.prefix]

  read(key: Key): Promise<Value> {
    return Promise.resolve(this.data.get(key) || null)
  }

  write(key: Key, value: Value): Promise<void> {
    this.data.set(key, value)
    return Promise.resolve()
  }

  delete(key: Key): Promise<void> {
    this.data.delete(key)
    return Promise.resolve()
  }

  search({
    term,
    strategy,
    first = this.SEARCH_FIRST_DEFAULT,
    after = `-1`,
  }: SearchOptions): Promise<SearchResult> {
    if (!this.searchStrategyIsValid(strategy))
      throw new Error(
        `Search strategy (${SearchStrategy[strategy]}) is not implemented!`
      )

    if (first > this.SEARCH_FIRST_LIMIT) first = this.SEARCH_FIRST_LIMIT
    if (first < 0) first = 0

    let keys = Array.from(this.data.keys()).filter((key: Key) =>
      key.startsWith(term)
    )

    keys = keys.slice(+after + 1)

    const hasNextPage = keys.length > first

    keys = keys.slice(0, first)

    const cursor = (+after + (hasNextPage ? first : keys.length)).toString()

    return Promise.resolve({
      keys,
      hasNextPage,
      cursor,
    })
  }
}
