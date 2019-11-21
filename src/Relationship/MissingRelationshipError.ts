import { KVORMError } from '../utils/errors'
import { EntityConstructor } from '../Entity/Entity'
import { RelationshipMetadata } from './relationshipMetadata'

export class MissingRelationshipError extends KVORMError {
  constructor(
    constructor: EntityConstructor,
    relationshipMetadata: RelationshipMetadata,
    message = `Unknown Error`
  ) {
    super(
      `Could not find the Relationship, ${relationshipMetadata.property.toString()}, with type, ${
        relationshipMetadata.relationType.name
      }, on Entity, ${constructor.name}: ${message}`
    )
    this.name = `MissingRelationshipError`
  }
}
