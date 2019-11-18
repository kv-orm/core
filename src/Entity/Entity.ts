import '../metadata'

import { Datastore, Key } from '../Datastore/Datastore'
import { ColumnKey, ColumnValue } from '../Column/Column'
import { createEntityMetadata, EntityMetadata } from './entityMetadata'

export const ENTITY_KEY = Symbol(`entityMetadata`)

export type BaseEntity = Record<ColumnKey, ColumnValue> // TODO: improve

export type EntityConstructor<T extends BaseEntity = BaseEntity> = {
  new (...args: any[]): T // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface EntityOptions {
  key?: Key
  datastore: Datastore
}

const assertKeyNotInUse = (
  datastore: Datastore,
  entityMetadata: EntityMetadata,
  constructor: EntityConstructor
): void => {
  // TODO
  // throw new EntitySetupError(constructor, `Key is already in use`)
}

export function Entity({
  datastore,
  key,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
EntityOptions): (constructor: EntityConstructor) => any {
  return function<T extends BaseEntity>(
    constructor: EntityConstructor<T>
  ): EntityConstructor<T> {
    const entityMetadata: EntityMetadata = createEntityMetadata({
      datastore,
      key: key || constructor.name,
    })
    assertKeyNotInUse(datastore, entityMetadata, constructor)

    Reflect.defineMetadata(ENTITY_KEY, entityMetadata, constructor)
    return constructor
  }
}
