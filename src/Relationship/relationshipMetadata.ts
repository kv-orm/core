import { Key } from '../Datastore/Datastore'
import { ColumnKey } from '../Column/Column'
import { EntityConstructor } from '../Entity/Entity'

export const RELATIONSHIP_KEY = Symbol(`Relationship`)

export interface RelationshipMetadata {
  key: Key
  property: ColumnKey
  type: EntityConstructor
}
