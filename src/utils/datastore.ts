import { EntityConstructor } from "../Entity/Entity";
import {
  Datastore,
  SearchOptions,
  SearchResult,
  Key,
  SearchStrategy,
} from "../Datastore/Datastore";
import { getEntityMetadata } from "./entities";
import { SearchStrategyError } from "../Datastore/SearchStrategyError";

export const getDatastore = (constructor: EntityConstructor): Datastore =>
  getEntityMetadata(constructor).datastore;

export const paginateSearch = async (
  datastore: Datastore,
  options: SearchOptions
): Promise<SearchResult> => {
  let results: SearchResult = await datastore.search(options);

  while (results.hasNextPage) {
    const result = await datastore.search({
      ...options,
      after: results.cursor,
    });
    const { keys, cursor, hasNextPage } = result;
    results = {
      keys: [...results.keys, ...keys],
      cursor,
      hasNextPage,
    };
  }

  return results;
};

export async function* keysFromSearch(
  datastore: Datastore,
  options: SearchOptions
): AsyncGenerator<Key> {
  let cursor;
  let hasNextPage = true;
  while (hasNextPage) {
    const searchResults: SearchResult = await datastore.search({
      ...options,
      after: cursor,
    });
    const { keys: queue } = searchResults;
    cursor = searchResults.cursor;
    hasNextPage = searchResults.hasNextPage;

    while (queue.length > 0) {
      const key = queue.shift();
      if (key !== undefined) yield key;
    }
  }
}

export const pickSearchStrategy = (datastore: Datastore): SearchStrategy => {
  let strategy;
  if (datastore.searchStrategies.indexOf(SearchStrategy.prefix) !== -1) {
    strategy = SearchStrategy.prefix;
  }

  if (strategy === undefined) {
    throw new SearchStrategyError(
      SearchStrategy.prefix,
      `Datastore does not support searching`
    );
  }
  return strategy;
};
