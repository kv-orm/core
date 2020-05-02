import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { PropertyKey } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import { getConstructor } from "../utils/entities";
import { toManySet } from "./toManySet";
import { createToManyRelationshipMetadata } from "./relationshipMetadata";
import { setToManyRelationshipMetadata } from "../utils/relationships";
import { toManyGet } from "./toManyGet";
import { assertKeyNotInUse, getPropertyMetadatas } from "../utils/metadata";

interface ToManyOptions {
  key?: Key;
  type: () => EntityConstructor;
  cascade?: boolean;
  backRef: PropertyKey;
}

export function ToMany(options: ToManyOptions) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const toManyRelationshipMetadata = createToManyRelationshipMetadata({
      options,
      property,
    });

    const constructor = getConstructor(instance);
    assertKeyNotInUse(constructor, toManyRelationshipMetadata, {
      getMetadatas: getPropertyMetadatas,
    });
    setToManyRelationshipMetadata(constructor, toManyRelationshipMetadata);

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: function get(this: BaseEntity) {
        return toManyGet(this, toManyRelationshipMetadata);
      },
      set: function set(this: BaseEntity, values: BaseEntity[]) {
        if (values) toManySet(this, toManyRelationshipMetadata, values);
      },
    });
  };
}
