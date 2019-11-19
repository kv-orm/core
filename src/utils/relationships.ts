import { EntityConstructor, PropertyKey } from '../Entity/Entity'
import {
  RelationshipMetadata,
  RELATIONSHIP_KEY,
} from '../Relationship/relationshipMetadata'
import { RelationshipLookupError } from './errors'
import {
  SearchOptions,
  Key,
  SearchResult,
  Datastore,
} from '../Datastore/Datastore'
import { extractManyRelationshipValueKey } from './keyGeneration'
import { getMetadatas, getMetadata, setMetadata } from './metadata'

export const getRelationshipMetadatas = (
  constructor: EntityConstructor
): RelationshipMetadata[] =>
  getMetadatas(RELATIONSHIP_KEY, constructor) as RelationshipMetadata[]

export const getRelationshipMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): RelationshipMetadata => {
  const relationshipMetadatas = getRelationshipMetadatas(constructor)
  return getMetadata(relationshipMetadatas, property, () => {
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find Relationship. Has it been defined yet?`
    )
  }) as RelationshipMetadata
}

export const setRelationshipMetadata = (
  constructor: EntityConstructor,
  relationshipMetadata: RelationshipMetadata
): void => setMetadata(RELATIONSHIP_KEY, constructor, relationshipMetadata)

export async function* keysFromSearch(
  datastore: Datastore,
  options: SearchOptions
): AsyncGenerator<Key> {
  let cursor
  let hasNextPage = true
  while (hasNextPage) {
    const searchResults: SearchResult = await datastore.search({
      ...options,
      after: cursor,
    })
    const { keys: queue } = searchResults
    cursor = searchResults.cursor
    hasNextPage = searchResults.hasNextPage

    while (queue.length > 0) {
      const key = queue.shift()
      if (key !== undefined)
        yield extractManyRelationshipValueKey(key, options.term)
    }
  }
}
