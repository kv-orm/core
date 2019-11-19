import { Key } from '../Datastore/Datastore'
import { PropertyKey } from '../Entity/Entity'
import { EntityConstructor } from '../Entity/Entity'

export const RELATIONSHIP_KEY = Symbol(`Relationship`)

export interface RelationshipMetadata {
  key: Key
  property: PropertyKey
  type: EntityConstructor
  plugins: {}
}

export const createRelationshipMetadata = (
  {
    options: { key, type },
    property,
  }: {
    options: { key?: string; type: EntityConstructor }
    property: PropertyKey
  },
  plugins = {}
): RelationshipMetadata => ({
  key: key || property.toString(),
  property,
  type,
  plugins,
})
