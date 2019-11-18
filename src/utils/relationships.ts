import { EntityConstructor } from '../Entity/Entity'
import {
  RelationshipMetadata,
  RELATIONSHIP_KEY,
} from '../Relationship/relationshipMetadata'
import { ColumnKey } from '../Column/Column'
import { RelationshipLookupError } from './errors'

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
  property: ColumnKey
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
