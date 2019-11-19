import '../metadata'

import { Datastore, Key } from '../Datastore/Datastore'
import { createEntityMetadata, EntityMetadata } from './entityMetadata'
import { setEntityMetadata, getEntityMetadata } from '../utils/entities'
import { assertKeyNotInUse } from '../utils/metadata'

export const ENTITY_KEY = Symbol(`entityMetadata`)

export type PropertyValue = any // eslint-disable-line @typescript-eslint/no-explicit-any
export type PropertyKey = string | number | symbol

export type BaseEntity = Record<PropertyKey, PropertyValue>

export type EntityConstructor<T extends BaseEntity = BaseEntity> = {
  new (...args: any[]): T // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface EntityOptions {
  key?: Key
  datastore: Datastore
}

export function Entity(
  { datastore, key }: EntityOptions,
  plugins = {} // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (constructor: EntityConstructor) => any {
  return function<T extends BaseEntity>(
    constructor: EntityConstructor<T>
  ): EntityConstructor<T> {
    const entityMetadata: EntityMetadata = createEntityMetadata(
      {
        datastore,
        key: key || constructor.name,
      },
      plugins
    )

    assertKeyNotInUse(constructor, entityMetadata, {
      getMetadatas: () => datastore.entityConstructors.map(getEntityMetadata),
    })
    datastore.registerEntity(constructor)
    setEntityMetadata(constructor, entityMetadata)

    return constructor
  }
}
