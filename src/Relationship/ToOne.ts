import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { PropertyKey } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import { getHydrator } from "../utils/hydrate";
import { getConstructor } from "../utils/entities";
import { toOneSet } from "./toOneSet";
import { createRelationshipMetadata } from "./relationshipMetadata";
import {
  setRelationshipMetadata,
  getRelationshipMetadatas,
} from "../utils/relationships";
import { toOneGet } from "./toOneGet";
import { assertKeyNotInUse } from "../utils/metadata";

interface ToOneOptions {
  key?: Key;
  type: EntityConstructor;
}
export function ToOne(options: ToOneOptions) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata = createRelationshipMetadata({
      options,
      property,
    });

    const constructor = getConstructor(instance);
    assertKeyNotInUse(constructor, relationshipMetadata, {
      getMetadatas: getRelationshipMetadatas,
    });
    setRelationshipMetadata(constructor, relationshipMetadata);

    const hydrator = getHydrator(options.type);

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: async function get(this: BaseEntity) {
        return await hydrator(await toOneGet(this, relationshipMetadata));
      },
      set: function set(this: BaseEntity, value: BaseEntity) {
        if (value) toOneSet(this, relationshipMetadata, value);
      },
    });
  };
}
