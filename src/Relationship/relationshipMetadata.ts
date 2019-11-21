import { Key } from '../Datastore/Datastore'
import { PropertyKey } from '../Entity/Entity'
import { EntityConstructor } from '../Entity/Entity'

export const RELATIONSHIP_KEY = Symbol(`Relationship`)
export enum RelationshipType {
  OneToOne,
  OneToMany,
}

export interface CascadeOptions {
  onSave: boolean
  onDelete: boolean
}

export interface RelationshipMetadata {
  key: Key
  property: PropertyKey
  relationType: EntityConstructor
  type: RelationshipType
  cascade: CascadeOptions
  plugins: {}
}

export const createRelationshipMetadata = (
  {
    options: {
      key,
      relationType,
      type,
      cascade = { onSave: false, onDelete: false },
    },
    property,
  }: {
    options: {
      key?: string
      relationType: EntityConstructor
      type: RelationshipType
      cascade?: CascadeOptions
    }
    property: PropertyKey
  },
  plugins = {}
): RelationshipMetadata => ({
  key: key || property.toString(),
  property,
  relationType,
  type,
  cascade,
  plugins,
})
