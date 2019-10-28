import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { ColumnKey, Column } from '../Column/Column'
import { Key } from '../Datastore/Datastore'
import { columnGet } from '../Column/columnGet'
import { getHydrator } from './hydrate'
import { columnSet } from '../Column/columnSet'
import { getDehydrator } from './dehydrate'

interface OneToManyOptions {
  key?: Key
  type: EntityConstructor<BaseEntity>
}

export function OneToMany(options: OneToManyOptions) {
  return (instance: BaseEntity, property: ColumnKey): void => {
    Column({ key: options.key })(instance, property)

    const hydrator = getHydrator(options.type)
    const dehydrator = getDehydrator(options.type)

    // Override Property
    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return [await hydrator((await columnGet(this, property))[0])]
      },
      set: function set(this: BaseEntity, values: BaseEntity[]) {
        if (values) {
          const dehydratedValues = values.map(dehydrator)
          return columnSet(this, property, dehydratedValues)
        }
      },
    })
  }
}
