import { EntityConstructor } from '../Entity/Entity'
import { Datastore, SearchOptions, SearchResult } from '../Datastore/Datastore'
import { getEntityMetadata } from './entities'

export const getDatastore = (constructor: EntityConstructor): Datastore =>
  getEntityMetadata(constructor).datastore

export const paginateSearch = async (
  datastore: Datastore,
  options: SearchOptions
): Promise<SearchResult> => {
  let results: SearchResult = await datastore.search(options)

  while (results.hasNextPage) {
    const result = await datastore.search({
      ...options,
      after: results.cursor,
    })
    const { keys, cursor, hasNextPage } = result
    results = {
      keys: [...results.keys, ...keys],
      cursor,
      hasNextPage,
    }
  }

  return results
}
