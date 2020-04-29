import { Datastore, Key } from "../Datastore/Datastore";
import { BaseEntity, EntityConstructor } from "./Entity";

export interface EntityMetadata {
  datastore: Datastore;
  key: Key;
  instances: BaseEntity[];
}

export const createEntityMetadata = ({
  options: { datastore, key },
  constructor,
}: {
  options: { datastore: Datastore; key?: Key };
  constructor: EntityConstructor;
}): EntityMetadata => ({
  datastore,
  key: key || constructor.name,
  instances: [], // TODO
});
