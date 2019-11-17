import { EntityConstructor } from '../Entity/Entity'
import {
  RelationshipMetadata,
  RELATIONSHIP_KEY,
} from '../Relationship/relationshipMetadata'
import { ColumnKey } from '../Column/Column'
import { RelationshipLookupError } from './errors'

export const getRelationships = (
  constructor: EntityConstructor
): RelationshipMetadata[] => {
  return Reflect.getMetadata(RELATIONSHIP_KEY, constructor) || []
}

const setRelationships = (
  constructor: EntityConstructor,
  relationships: RelationshipMetadata[]
): void => {
  Reflect.defineMetadata(RELATIONSHIP_KEY, relationships, constructor)
}

export const getRelationship = (
  constructor: EntityConstructor,
  property: ColumnKey
): RelationshipMetadata => {
  const relationships = getRelationships(constructor)
  const relationship = relationships.find(({ property: p }) => p === property)
  if (relationship === undefined)
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find Relationship. Has it been defined yet?`
    )

  return relationship
}

export const setRelationship = (
  constructor: EntityConstructor,
  relationship: RelationshipMetadata
): void => {
  const relationships = getRelationships(constructor)
  relationships.push(relationship)
  setRelationships(constructor, relationships)
}
