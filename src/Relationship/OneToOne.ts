import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entities'
import { oneToOneSet } from './oneToOneSet'
import {
  createRelationshipMetadata,
  RelationshipType,
  CascadeOptions,
} from './relationshipMetadata'
import {
  setRelationshipMetadata,
  getRelationshipMetadatas,
} from '../utils/relationships'
import { oneToOneGet } from './oneToOneGet'
import { assertKeyNotInUse } from '../utils/metadata'

interface OneToOneOptions {
  key?: Key
  type: EntityConstructor
  cascade?: CascadeOptions
}
export function OneToOne(options: OneToOneOptions, plugins = {}) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata = createRelationshipMetadata(
      {
        options: {
          key: options.key,
          relationType: options.type,
          type: RelationshipType.OneToOne,
          cascade: options.cascade,
        },
        property,
      },
      plugins
    )

    const constructor = getConstructor(instance)
    assertKeyNotInUse(constructor, relationshipMetadata, {
      getMetadatas: getRelationshipMetadatas,
    })
    setRelationshipMetadata(constructor, relationshipMetadata)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: function get(this: BaseEntity) {
        return oneToOneGet(this, relationshipMetadata)
      },
      set: function set(this: BaseEntity, value: BaseEntity) {
        if (value) oneToOneSet(this, relationshipMetadata, value)
      },
    })
  }
}
