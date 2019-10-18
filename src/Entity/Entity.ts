import '../metadata'

import { Datastore, Key } from '../Datastore/Datastore'
import { ColumnKey, ColumnValue } from '../Column/Column'

export const ENTITY_METADATA_KEY = Symbol(`entityMetadata`)

export type BaseEntity = Record<ColumnKey, ColumnValue> // TODO: improve

export type EntityConstructor<T extends BaseEntity> = {
  new (...args: any[]): T // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface EntityConstructorMetadata {
  datastore: Datastore
  key: Key
  instances: BaseEntity[]
}

const createEntityConstructorMetadata = ({
  datastore,
  key,
}: {
  datastore: Datastore
  key: Key
}): EntityConstructorMetadata => ({
  datastore,
  key,
  instances: [], // TODO
})

interface EntityOptions {
  key?: Key
  datastore: Datastore
}

export function Entity({
  datastore,
  key,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
EntityOptions): (constructor: any) => any {
  return function<T extends BaseEntity>(
    constructor: EntityConstructor<T>
  ): EntityConstructor<T> {
    Reflect.defineMetadata(
      ENTITY_METADATA_KEY,
      createEntityConstructorMetadata({
        datastore,
        key: key || constructor.name,
      }),
      constructor
    )
    return constructor
  }
}
