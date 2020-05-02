import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { PropertyKey } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import { getConstructor } from "../utils/entities";
import { toOneSet } from "./toOneSet";
import {
  createToOneRelationshipMetadata,
  RelationshipOptions,
} from "./relationshipMetadata";
import { setToOneRelationshipMetadata } from "../utils/relationships";
import { toOneGet } from "./toOneGet";
import { assertKeyNotInUse, getPropertyMetadatas } from "../utils/metadata";

interface ToOneOptions {
  key?: Key;
  type: () => EntityConstructor;
  cascade?: boolean;
  backRef: PropertyKey;
}
export function ToOne(options: ToOneOptions) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const toOneRelationshipMetadata = createToOneRelationshipMetadata({
      options,
      property,
    });

    const constructor = getConstructor(instance);
    assertKeyNotInUse(constructor, toOneRelationshipMetadata, {
      getMetadatas: getPropertyMetadatas,
    });
    setToOneRelationshipMetadata(constructor, toOneRelationshipMetadata);

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return toOneGet(this, toOneRelationshipMetadata);
      },
      set: function set(this: BaseEntity, value: BaseEntity) {
        if (value) toOneSet(this, toOneRelationshipMetadata, value);
      },
    });
  };
}
