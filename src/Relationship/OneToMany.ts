import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getHydrator } from './hydrate'
import { getConstructor } from '../utils/entities'
import { oneToManySet } from './oneToManySet'
import {
  createRelationshipMetadata,
  RelationshipType,
  CascadeOptions,
} from './relationshipMetadata'
import {
  setRelationshipMetadata,
  getRelationshipMetadatas,
} from '../utils/relationships'
import { oneToManyGet } from './oneToManyGet'
import { assertKeyNotInUse } from '../utils/metadata'

interface OneToManyOptions {
  key?: Key
  type: EntityConstructor
  cascade?: CascadeOptions
}

export function OneToMany(options: OneToManyOptions, plugins = {}) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata = createRelationshipMetadata(
      {
        options: {
          key: options.key,
          relationType: options.type,
          type: RelationshipType.OneToMany,
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
        return oneToManyGet(
          this,
          relationshipMetadata,
          getHydrator(options.type)
        )
      },
      set: function set(this: BaseEntity, values: BaseEntity[]) {
        if (values) {
          oneToManySet(this, relationshipMetadata, values)
        }
      },
    })
  }
}
