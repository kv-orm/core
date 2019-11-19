import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getHydrator } from './hydrate'
import { getConstructor } from '../utils/entities'
import { oneToOneSet } from './oneToOneSet'
import { createRelationshipMetadata } from './relationshipMetadata'
import {
  setRelationshipMetadata,
  getRelationshipMetadatas,
} from '../utils/relationships'
import { oneToOneGet } from './oneToOneGet'
import { assertKeyNotInUse } from '../utils/metadata'

interface OneToOneOptions {
  key?: Key
  type: EntityConstructor
}
export function OneToOne(options: OneToOneOptions, plugins = {}) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata = createRelationshipMetadata(
      {
        options,
        property,
      },
      plugins
    )

    const constructor = getConstructor(instance)
    assertKeyNotInUse(constructor, relationshipMetadata, {
      getMetadatas: getRelationshipMetadatas,
    })
    setRelationshipMetadata(constructor, relationshipMetadata)

    const hydrator = getHydrator(options.type)

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return await hydrator(await oneToOneGet(this, relationshipMetadata))
      },
      set: function set(this: BaseEntity, value: BaseEntity) {
        if (value) oneToOneSet(this, relationshipMetadata, value)
      },
    })
  }
}
