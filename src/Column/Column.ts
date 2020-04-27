import "../metadata";

import { Key } from "../Datastore/Datastore";
import { BaseEntity, PropertyValue } from "../Entity/Entity";
import { setColumnMetadata, getColumnMetadatas } from "../utils/columns";
import { getConstructor } from "../utils/entities";
import { columnGet } from "./columnGet";
import { columnSet } from "./columnSet";
import { createColumnMetadata } from "./columnMetadata";
import { assertKeyNotInUse } from "../utils/metadata";

export const COLUMN_KEY = Symbol(`Column`);

interface ColumnOptions {
  key?: Key;
  isPrimary?: boolean;
  isIndexable?: boolean;
  isUnique?: boolean;
}

export const Column = <T extends BaseEntity>(
  options: ColumnOptions = {},
  plugins = {}
) => {
  return (instance: T, property: keyof T): void => {
    const columnMetadata = createColumnMetadata(
      {
        options,
        property,
      },
      plugins
    );

    const constructor = getConstructor(instance);
    assertKeyNotInUse(constructor, columnMetadata, {
      getMetadatas: getColumnMetadatas,
    });
    setColumnMetadata(constructor, columnMetadata);

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return await columnGet(this, columnMetadata);
      },
      set: function set(this: BaseEntity, value: PropertyValue) {
        columnSet(this, columnMetadata, value);
      },
    });
  };
};
