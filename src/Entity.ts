import './metadata'

import { Datastore, Key } from './Datastore'
import { ColumnKey, ColumnValue } from './Column'

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
    const entityConstructorMetadata: EntityConstructorMetadata = {
      datastore,
      key: key || constructor.name,
      instances: [], // TODO
    }

    Reflect.defineMetadata(
      ENTITY_METADATA_KEY,
      entityConstructorMetadata,
      constructor
    )

    return constructor
  }
}
