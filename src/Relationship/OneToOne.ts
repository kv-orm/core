import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Key } from '../Datastore/Datastore'
import { getHydrator } from './hydrate'
import { getConstructor } from '../utils/entities'
import { oneToOneSet } from './oneToOneSet'
import { RelationshipMetadata } from './relationshipMetadata'
import { setRelationshipMetadata } from '../utils/relationships'
import { oneToOneGet } from './oneToOneGet'

interface OneToOneOptions {
  key?: Key
  type: EntityConstructor
}

export function OneToOne(options: OneToOneOptions) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata: RelationshipMetadata = {
      key: options.key || property.toString(),
      property,
      type: options.type,
    }
    const constructor = getConstructor(instance)
    // TODO: Assert key not in use
    setRelationshipMetadata(constructor, relationshipMetadata)

    const hydrator = getHydrator(options.type)

    // Override Property
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
