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

export const getRelationshipMetadatas = (
  constructor: EntityConstructor
): RelationshipMetadata[] => {
  return Reflect.getMetadata(RELATIONSHIP_KEY, constructor) || []
}

const setRelationshipMetadatas = (
  constructor: EntityConstructor,
  relationshipMetadatas: RelationshipMetadata[]
): void => {
  Reflect.defineMetadata(RELATIONSHIP_KEY, relationshipMetadatas, constructor)
}

export const getRelationshipMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): RelationshipMetadata => {
  const relationshipMetadatas = getRelationshipMetadatas(constructor)
  const relationshipMetadata = relationshipMetadatas.find(
    ({ property: p }) => p === property
  )
  if (relationshipMetadata === undefined)
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find Relationship. Has it been defined yet?`
    )

  return relationshipMetadata
}

export const setRelationshipMetadata = (
  constructor: EntityConstructor,
  relationshipMetadata: RelationshipMetadata
): void => {
  const relationshipMetadatas = getRelationshipMetadatas(constructor)
  relationshipMetadatas.push(relationshipMetadata)
  setRelationshipMetadatas(constructor, relationshipMetadatas)
}

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
