import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { ColumnKey } from '../Column/Column'
import { Key } from '../Datastore/Datastore'
import { getHydrator } from './hydrate'
import { getConstructor } from '../utils/entities'
import { oneToManySet } from './oneToManySet'
import { RelationshipMetadata } from './relationshipMetadata'
import { setRelationshipMetadata } from '../utils/relationships'
import { oneToManyGet } from './oneToManyGet'

interface OneToManyOptions {
  key?: Key
  type: EntityConstructor
}

export function OneToMany(options: OneToManyOptions) {
  return (instance: BaseEntity, property: ColumnKey): void => {
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
        const values = await oneToManyGet(this, relationshipMetadata)
        return Promise.all(values.map(hydrator))
      },
      set: function set(this: BaseEntity, values: BaseEntity[]) {
        if (values) {
          oneToManySet(this, relationshipMetadata, values)
        }
      },
    })
  }
}
