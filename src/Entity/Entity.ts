import "../metadata";

import { Datastore, Key } from "../Datastore/Datastore";
import { createEntityMetadata, EntityMetadata } from "./entityMetadata";
import { setEntityMetadata, getEntityMetadata } from "../utils/entities";
import { assertKeyNotInUse } from "../utils/metadata";

export const ENTITY_KEY = Symbol(`Entity`);

export type PropertyValue = any;
export type PropertyKey = string | number | symbol;

export type BaseEntity = Record<PropertyKey, PropertyValue>;

export type EntityConstructor<T extends BaseEntity = BaseEntity> = {
  new (...args: any[]): T;
};

interface EntityOptions {
  key?: Key;
  datastore: Datastore;
}

export function Entity({
  datastore,
  key,
}: EntityOptions): (constructor: EntityConstructor) => any {
  return function <T extends BaseEntity>(
    constructor: EntityConstructor<T>
  ): EntityConstructor<T> {
    const entityMetadata: EntityMetadata = createEntityMetadata({
      options: { datastore, key },
      constructor,
    });

    assertKeyNotInUse(constructor, entityMetadata, {
      getMetadatas: () => datastore.entityConstructors.map(getEntityMetadata),
    });
    datastore.registerEntity(constructor);
    setEntityMetadata(constructor, entityMetadata);

    return constructor;
  };
}
